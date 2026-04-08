export interface PunchRecord {
  studentId: string;
  name: string;
  rollNo: string;
  division: string;
  branch: string;
  year: number;
  punchTime: string;
}

export interface Subject {
  subjectName: string;
  subjectCode: string;
  status: "P" | "A" | "-";
}

export interface LectureRecord {
  studentId: string;
  name: string;
  rollNo: string;
  division: string;
  branch: string;
  year: number;
  subjects: Subject[];
}

export interface GhostStudent {
  studentId: string;
  name: string;
  rollNo: string;
  division: string;
  branch: string;
  year: number;
  punchTime: string;
  missedSubjects: string[];
  email?: string;
}

export interface StudentSummary {
  totalPunchedIn: number;
  totalGhosts: number;
  totalClean: number;
}

export interface FilterState {
  division: string;
  branch: string;
  showGhostsOnly: boolean;
}
