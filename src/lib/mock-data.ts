import type { LectureRecord, PunchRecord, Subject } from "@/lib/types";

interface StudentProfile extends PunchRecord {
  email: string;
}

const students: StudentProfile[] = [
  // Division K - Automation & Robotics
  { studentId: "SF001", name: "Aditya", email: "krish@gmail.com", rollNo: "", division: "K", branch: "Automation & Robotics", year: 1, punchTime: "08:05am" },
  { studentId: "SF002", name: "Prachi", email: "prachi@example.com", rollNo: "", division: "K", branch: "Automation & Robotics", year: 1, punchTime: "08:12am" },
  { studentId: "SF009", name: "Riya", email: "riya@example.com", rollNo: "", division: "K", branch: "Automation & Robotics", year: 1, punchTime: "08:20am" },

  // Division P - AIDS
  { studentId: "SF003", name: "Atul", email: "atul@example.com", rollNo: "", division: "P", branch: "AIDS", year: 1, punchTime: "08:28am" },
  { studentId: "SF004", name: "Gauri", email: "gauri@example.com", rollNo: "", division: "P", branch: "AIDS", year: 1, punchTime: "08:36am" },
  { studentId: "SF007", name: "Om", email: "om@example.com", rollNo: "", division: "P", branch: "AIDS", year: 1, punchTime: "08:44am" },

  // Division J - AI/ML
  
  { studentId: "SF006", name: "Yogesh", email: "yogesh@example.com", rollNo: "", division: "J", branch: "AI/ML", year: 1, punchTime: "09:03am" },
  { studentId: "SF010", name: "Shreya", email: "shreya@example.com", rollNo: "", division: "J", branch: "AI/ML", year: 1, punchTime: "09:12am" },

  // Division H - ENTC
  { studentId: "SF008", name: "Purva", email: "purva@example.com", rollNo: "", division: "H", branch: "ENTC", year: 1, punchTime: "09:18am" },
  { studentId: "SF011", name: "Soham", email: "soham@example.com", rollNo: "", division: "H", branch: "ENTC", year: 1, punchTime: "09:24am" },
  { studentId: "SF012", name: "Ronit", email: "ronit@example.com", rollNo: "", division: "H", branch: "ENTC", year: 1, punchTime: "09:30am" }
];

const subjectsTemplate: Omit<Subject, "status">[] = [
  { subjectName: "EM-II", subjectCode: "2401120" },
  { subjectName: "EPH", subjectCode: "2401102" },
  { subjectName: "EXE", subjectCode: "2417107" },
  { subjectName: "PE&S", subjectCode: "2400119" },
];

// Keep this list editable to control who is ghost today.
const ghostStudentIds = new Set(["SF001", "SF002", "SF003", "SF004", "SF005", "SF006","SF009"]);

function buildPunchData(): PunchRecord[] {
  return students.map((student) => {
    const { email, ...studentRecord } = student;
    void email;
    return studentRecord;
  });
}

function buildSubjects(studentId: string, studentIndex: number): Subject[] {
  const lectureCount = 3 + (studentIndex % 3);
  const subjects = subjectsTemplate.slice(0, lectureCount);
  const absentIndex = studentIndex % lectureCount;
  // Give some students multiple missed subjects (every 3rd ghost gets 2 absences)
  const secondAbsentIndex = (studentIndex % 2 === 0) ? (absentIndex + 1) % lectureCount : -1;

  return subjects.map((subject, index) => {
    if (ghostStudentIds.has(studentId) && (index === absentIndex || index === secondAbsentIndex)) {
      return { ...subject, status: "A" };
    }
    return { ...subject, status: "P" };
  });
}

function buildLectureData(): LectureRecord[] {
  return students.map((student, index) => {
    const { email, punchTime, ...studentRecord } = student;
    void email;
    void punchTime;

    return {
      ...studentRecord,
      subjects: buildSubjects(student.studentId, index),
    };
  });
}

// ============================================
// IT TEAM INTEGRATION POINT
// Replace this mock with your real ERP API call
// Expected return format: see type above
// ============================================
export async function getPunchData(date: string): Promise<PunchRecord[]> {
  void date;
  const punchData = buildPunchData();
  return new Promise((resolve) => {
    setTimeout(() => resolve(punchData), 120);
  });
}

// ============================================
// IT TEAM INTEGRATION POINT
// Replace this mock with your real ERP API call
// Expected return format: see type above
// ============================================
export async function getLectureData(date: string): Promise<LectureRecord[]> {
  void date;
  const lectureData = buildLectureData();
  return new Promise((resolve) => {
    setTimeout(() => resolve(lectureData), 120);
  });
}
