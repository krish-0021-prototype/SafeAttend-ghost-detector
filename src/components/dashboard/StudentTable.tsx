"use client";

import { useState, Fragment } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PunchRecord, Subject } from '@/lib/types';
import { ChevronDown, ChevronRight, Loader2, Bell } from 'lucide-react';

interface StudentWithSubjects extends PunchRecord {
  allSubjects?: Subject[];
  isGhost: boolean;
  missedSubjects?: string[];
  email?: string;
}

interface StudentTableProps {
  students: StudentWithSubjects[];
  onNotify: (student: StudentWithSubjects) => void;
  notifyingId: string | null;
}

export function StudentTable({ students, onNotify, notifyingId }: StudentTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (studentId: string) => {
    setExpandedRow(expandedRow === studentId ? null : studentId);
  };

  const getStatusBadge = (status: "P" | "A" | "-") => {
    switch (status) {
      case "P":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            Present
          </Badge>
        );
      case "A":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Absent
          </Badge>
        );
      case "-":
        return (
          <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
            No Class
          </Badge>
        );
    }
  };

  if (students.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
        No students found for the selected filters.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Roll No</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Punch Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <Fragment key={student.studentId}>
              <TableRow
                className="cursor-pointer"
                onClick={() => toggleRow(student.studentId)}
              >
                <TableCell>
                  {expandedRow === student.studentId ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.rollNo || '-'}</TableCell>
                <TableCell>{student.division}</TableCell>
                <TableCell>{student.punchTime}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {student.isGhost && student.missedSubjects ? (
                      student.missedSubjects.map((subject, idx) => (
                        <Badge key={idx} className="bg-red-100 text-red-700 hover:bg-red-100">
                          {subject}
                        </Badge>
                      ))
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Clean
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {student.isGhost && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNotify(student);
                      }}
                      disabled={notifyingId !== null}
                    >
                      {notifyingId === student.studentId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Bell className="h-4 w-4 mr-1" />
                          Notify
                        </>
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>

              {expandedRow === student.studentId && student.allSubjects && (
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell colSpan={7} className="p-0">
                    <div className="p-4">
                      <h4 className="mb-3 text-sm font-semibold text-foreground">
                        Subject-wise Attendance
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {student.allSubjects.map((subject, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border bg-white p-3"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {subject.subjectName}
                              </p>
                            </div>
                            {getStatusBadge(subject.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
