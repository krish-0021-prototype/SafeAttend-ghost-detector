"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GhostStudent } from '@/lib/types';
import { Loader2, Bell, CheckCircle, XCircle } from 'lucide-react';
import { notifyStudent } from '@/app/actions';

interface ProcessingResult {
  name: string;
  success: boolean;
  message?: string;
}

interface NotifyAllButtonProps {
  ghostStudents: GhostStudent[];
  onComplete: (results: ProcessingResult[]) => void;
}

type ProcessingStatus = 'idle' | 'processing' | 'complete';

interface LogEntry {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
}

export function NotifyAllButton({ ghostStudents, onComplete }: NotifyAllButtonProps) {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNotifyAll = async () => {
    if (ghostStudents.length === 0) return;

    setStatus('processing');
    setCurrentIndex(0);
    
    // Initialize logs
    const initialLogs: LogEntry[] = ghostStudents.map((s) => ({
      id: s.studentId,
      name: s.name,
      status: 'pending',
    }));
    setLogs(initialLogs);

    const results: ProcessingResult[] = [];

    for (let i = 0; i < ghostStudents.length; i++) {
      const student = ghostStudents[i];
      setCurrentIndex(i);
      
      // Update log to processing
      setLogs((prev) =>
        prev.map((log) =>
          log.id === student.studentId ? { ...log, status: 'processing' } : log
        )
      );

      try {
        // Call server action that generates notification and sends email
        if (student.email) {
          const result = await notifyStudent({
            email: student.email,
            name: student.name,
            rollNo: student.rollNo,
            missedSubjects: student.missedSubjects.map((s) => s.split(' (')[0]),
          });

          if (result.success) {
            results.push({ name: student.name, success: true });
            setLogs((prev) =>
              prev.map((log) =>
                log.id === student.studentId
                  ? { ...log, status: 'success', message: 'Sent' }
                  : log
              )
            );
          } else {
            results.push({ name: student.name, success: false, message: result.message });
            setLogs((prev) =>
              prev.map((log) =>
                log.id === student.studentId
                  ? { ...log, status: 'error', message: result.message || 'Failed' }
                  : log
              )
            );
          }
        } else {
          results.push({ name: student.name, success: false, message: 'No email' });
          setLogs((prev) =>
            prev.map((log) =>
              log.id === student.studentId
                ? { ...log, status: 'error', message: 'No email' }
                : log
            )
          );
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.push({ name: student.name, success: false, message: errorMsg });
        setLogs((prev) =>
          prev.map((log) =>
            log.id === student.studentId
              ? { ...log, status: 'error', message: errorMsg }
              : log
          )
        );
      }
    }

    setStatus('complete');
    onComplete(results);
  };

  const getStatusIcon = (status: LogEntry['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  const getStatusBadge = (status: LogEntry['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            Sent
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Failed
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Sending...
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleNotifyAll}
          disabled={status === 'processing' || ghostStudents.length === 0}
          size="lg"
          className="gap-2"
        >
          {status === 'processing' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing {currentIndex + 1}/{ghostStudents.length}...
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" />
              Notify All Ghost Students ({ghostStudents.length})
            </>
          )}
        </Button>

        {status === 'complete' && (
          <Badge className="bg-emerald-100 text-emerald-700">
            Complete
          </Badge>
        )}
      </div>

      {logs.length > 0 && (
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b bg-muted/50 px-4 py-2">
            <h4 className="text-sm font-semibold">Processing Log</h4>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="divide-y">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-4 py-2"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <span className="text-sm font-medium">{log.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.message && log.status === 'error' && (
                      <span className="text-xs text-red-600">{log.message}</span>
                    )}
                    {getStatusBadge(log.status)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
