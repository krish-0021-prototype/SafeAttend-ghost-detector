"use client";

import { useState, useMemo } from 'react';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { GhostTable } from '@/components/dashboard/GhostTable';
import { StudentTable } from '@/components/dashboard/StudentTable';
import { NotifyAllButton } from '@/components/dashboard/NotifyAllButton';
import type { GhostStudent, StudentSummary, FilterState, PunchRecord, Subject } from '@/lib/types';
import { notifyStudent } from '@/app/actions';

interface StudentWithSubjects extends PunchRecord {
  allSubjects?: Subject[];
  isGhost: boolean;
  missedSubjects?: string[];
  email?: string;
}

interface DashboardContentProps {
  summary: StudentSummary;
  allStudents: StudentWithSubjects[];
  todayFormatted: string;
}

export function DashboardContent({ summary, allStudents, todayFormatted }: DashboardContentProps) {
  const [filters, setFilters] = useState<FilterState>({
    division: '',
    branch: '',
    showGhostsOnly: true,
  });
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    let result = allStudents;
    
    // Apply division filter
    if (filters.division) {
      result = result.filter((s) => s.division === filters.division);
    }
    
    // Apply branch filter
    if (filters.branch) {
      result = result.filter((s) => s.branch === filters.branch);
    }
    
    // Apply ghosts only filter
    if (filters.showGhostsOnly) {
      result = result.filter((s) => s.isGhost);
    }
    
    return result;
  }, [allStudents, filters]);

  const ghostStudents = useMemo(() => {
    return filteredStudents.filter((s) => s.isGhost);
  }, [filteredStudents]);

  const ghostStudentsForNotify = useMemo(() => {
    return ghostStudents.map(s => ({
      studentId: s.studentId,
      name: s.name,
      rollNo: s.rollNo,
      division: s.division,
      branch: s.branch,
      year: s.year,
      punchTime: s.punchTime,
      missedSubjects: s.missedSubjects || [],
      email: s.email,
    }));
  }, [ghostStudents]);

  const handleNotify = async (student: StudentWithSubjects) => {
    if (!student.isGhost || !student.email) return;
    
    setNotifyingId(student.studentId);
    
    await notifyStudent({
      email: student.email,
      name: student.name,
      rollNo: student.rollNo,
      missedSubjects: student.missedSubjects?.map((s) => s.split(' (')[0]) || [],
    });
    
    setNotifyingId(null);
  };

  const handleNotifyAllComplete = (results: { name: string; success: boolean }[]) => {
    console.log('Notification results:', results);
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">
          Sandip Foundation • {todayFormatted}
        </p>
      </div>

      <SummaryCards summary={summary} />

      <div className="mt-8">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-8">
        <NotifyAllButton
          ghostStudents={ghostStudentsForNotify}
          onComplete={handleNotifyAllComplete}
        />
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          {filters.showGhostsOnly 
            ? `Ghost Students (${filteredStudents.length})`
            : `All Students (${filteredStudents.length})`
          }
        </h3>
        {filters.showGhostsOnly ? (
          <GhostTable
            students={ghostStudentsForNotify.map(s => ({
              ...s,
              allSubjects: ghostStudents.find(g => g.studentId === s.studentId)?.allSubjects,
            }))}
            onNotify={(student) => {
              const fullStudent = ghostStudents.find(g => g.studentId === student.studentId);
              if (fullStudent) handleNotify(fullStudent);
            }}
            notifyingId={notifyingId}
          />
        ) : (
          <StudentTable
            students={filteredStudents}
            onNotify={handleNotify}
            notifyingId={notifyingId}
          />
        )}
      </div>
    </>
  );
}
