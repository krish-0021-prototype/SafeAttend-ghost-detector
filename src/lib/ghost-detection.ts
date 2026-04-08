import type { GhostStudent, StudentSummary } from "@/lib/types";
import { getLectureData, getPunchData } from "@/lib/mock-data";

// Student emails map for ghost detection
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

export async function getGhostStudents(date: string): Promise<GhostStudent[]> {
  const [punchData, lectureData] = await Promise.all([
    getPunchData(date),
    getLectureData(date),
  ]);

  const lectureByStudentId = new Map(
    lectureData.map((lectureRecord) => [lectureRecord.studentId, lectureRecord])
  );

  return punchData
    .map((punchRecord) => {
      const lectureRecord = lectureByStudentId.get(punchRecord.studentId);
      if (!lectureRecord) {
        return null;
      }

      const missedSubjects = lectureRecord.subjects
        .filter((subject) => subject.status === "A")
        .map((subject) => subject.subjectName);

      if (missedSubjects.length === 0) {
        return null;
      }

      return {
        studentId: punchRecord.studentId,
        name: punchRecord.name,
        rollNo: punchRecord.rollNo,
        division: punchRecord.division,
        branch: punchRecord.branch,
        year: punchRecord.year,
        punchTime: punchRecord.punchTime,
        missedSubjects,
        email: studentEmails[punchRecord.studentId],
      };
    })
    .filter((ghostStudent): ghostStudent is NonNullable<typeof ghostStudent> => ghostStudent !== null);
}

export async function getSummary(date: string): Promise<StudentSummary> {
  const [punchData, ghostStudents] = await Promise.all([
    getPunchData(date),
    getGhostStudents(date),
  ]);

  const totalPunchedIn = punchData.length;
  const totalGhosts = ghostStudents.length;
  const totalClean = totalPunchedIn - totalGhosts;

  return {
    totalPunchedIn,
    totalGhosts,
    totalClean,
  };
}
