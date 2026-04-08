# SafeAttend Ghost Detector

A Next.js dashboard for Sandip Foundation that identifies "ghost students" — students who punched in but missed lectures. Features generated email alerts and real-time filtering for HODs and class teachers.

## Quick Start

```bash
npm install
```

Create `.env.local`:
```env
RESEND_API_KEY=re_your_key_here
FROM_EMAIL=onboarding@resend.dev  # For testing; change to your domain for production
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## IT Team Integration

Replace these 2 mock functions in `src/lib/mock-data.ts` with your ERP API calls:

### 1. `getPunchData(date)`
**Current:** Returns mock punch records.  
**Replace with:** Your ERP endpoint that returns students who punched in today.

```typescript
// Expected return type: PunchRecord[]
interface PunchRecord {
  studentId: string;
  name: string;
  rollNo: string;
  division: string;
  branch: string;
  year: number;
  punchTime: string;
}
```

### 2. `getLectureData(date)`
**Current:** Returns mock lecture attendance  
**Replace with:** Your ERP endpoint that returns lecture attendance records

```typescript
// Expected return type: LectureRecord[]
interface LectureRecord {
  studentId: string;
  name: string;
  rollNo: string;
  division: string;
  branch: string;
  year: number;
  subjects: {
    subjectName: string;
    subjectCode: string;
    status: "P" | "A" | "-";  // Present, Absent, No Class
  }[];
}
```

Both functions receive `date` parameter formatted as `YYYY-MM-DD`.

## Features

- **Ghost Detection:** Automatically flags students with punch-in but lecture absences
- **HOD Dashboard:** Division/Branch filters with summary cards
- **Class Teacher View:** Toggle between "All Students" and "Ghosts Only"
- **Bulk Actions:** Notify all ghost students with live processing log

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Resend (Email)
- Template-based Notifications 
