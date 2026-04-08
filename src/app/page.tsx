import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { getGhostStudents, getSummary } from '@/lib/ghost-detection';
import { getLectureData, getPunchData } from '@/lib/mock-data';
import type { PunchRecord, Subject } from '@/lib/types';

interface StudentWithSubjects extends PunchRecord {
  allSubjects?: Subject[];
  isGhost: boolean;
  missedSubjects?: string[];
  email?: string;
}

// Student emails map
const studentEmails: Record<string, string> = {
  "SF001": "krishwebsite2000@gmail.com",
  "SF002": "prachi@example.com",
  "SF003": "atul@example.com",
  "SF004": "gauri@example.com",
  "SF005": "kanishk@example.com",
  "SF006": "yogesh@example.com",
  "SF007": "om@example.com",
  "SF008": "purva@example.com",
  "SF009": "riya@example.com",
  "SF010": "shreya@example.com",
  "SF011": "soham@example.com",
  "SF012": "ronit@example.com",
};

export default async function Home() {
  const today = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const [summary, ghostsData, lectureData, punchData] = await Promise.all([
    getSummary(today),
    getGhostStudents(today),
    getLectureData(today),
    getPunchData(today),
  ]);

  // Build a set of ghost student IDs for quick lookup
  const ghostIds = new Set(ghostsData.map(g => g.studentId));
  
  // Build a map of lecture data by student ID
  const lectureMap = new Map(lectureData.map(l => [l.studentId, l]));
  
  // Build a map of ghost data by student ID
  const ghostMap = new Map(ghostsData.map(g => [g.studentId, g]));

  // Build all students list with their status
  const allStudents: StudentWithSubjects[] = punchData.map(punch => {
    const lecture = lectureMap.get(punch.studentId);
    const ghost = ghostMap.get(punch.studentId);
    
    return {
      ...punch,
      allSubjects: lecture?.subjects,
      isGhost: ghostIds.has(punch.studentId),
      missedSubjects: ghost?.missedSubjects || [],
      email: studentEmails[punch.studentId],
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">S</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">SafeAttend</h1>
                <p className="text-sm text-muted-foreground">Ghost Detector</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Sandip Foundation</p>
              <p className="text-xs text-muted-foreground">{todayFormatted}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardContent 
          summary={summary} 
          allStudents={allStudents}
          todayFormatted={todayFormatted}
        />
      </main>
    </div>
  );
}
