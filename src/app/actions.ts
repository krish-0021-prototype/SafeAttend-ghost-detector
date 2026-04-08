'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

interface SendEmailOutput {
  success: boolean;
  message: string;
}

interface NotifyStudentInput {
  email: string;
  name: string;
  rollNo: string;
  missedSubjects: string[];
}

interface NotifyStudentOutput {
  success: boolean;
  message: string;
}

// Template-based notification generator 
function generateNotificationTemplate(name: string, rollNo: string, missedSubjects: string[]): string {
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Short format - just subject names
  const subjectsList = missedSubjects.join(', ');

  return `Alert: ${name} (${rollNo}) entered the sandip foundation on ${date} but missed/bunk: ${subjectsList} Don't repeat this.

Sandip Foundation`;
}

export async function sendEmail({ to, subject, body }: SendEmailInput): Promise<SendEmailOutput> {
  try {
    const fromEmail = process.env.FROM_EMAIL;

    if (!fromEmail) {
      return {
        success: false,
        message: 'FROM_EMAIL environment variable is not set',
      };
    }

    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      text: body,
    });

    if (result.error) {
      return {
        success: false,
        message: `Email failed: ${result.error.message}`,
      };
    }

    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `Email failed: ${errorMessage}`,
    };
  }
}

export async function notifyStudent({ email, name, rollNo, missedSubjects }: NotifyStudentInput): Promise<NotifyStudentOutput> {
  try {
    // Generate notification using template.
    const message = generateNotificationTemplate(name, rollNo, missedSubjects);

    // Send email via Resend
    const emailResult = await sendEmail({
      to: email,
      subject: 'Bunk Student Alert',
      body: message,
    });

    return emailResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `Notification failed: ${errorMessage}`,
    };
  }
}
