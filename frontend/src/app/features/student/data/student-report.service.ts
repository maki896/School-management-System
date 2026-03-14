import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ApiService } from '../../../core/services/api.service';

export interface StudentSummaryRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Student';
  status: 'active' | 'inactive';
  studentIdentifier?: string;
}

export interface StudentGradeRecord {
  id: string;
  name: string;
  academicYear: string;
  status: 'active' | 'inactive';
}

export interface StudentMarkRecord {
  id: string;
  studentId: string;
  studentName?: string;
  subjectId: string;
  subjectName?: string;
  gradeId: string;
  gradeName?: string;
  teacherId: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  term: string;
  status: 'draft' | 'published';
  recordedAt: string;
}

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  gradeId: string;
  gradeName?: string;
  subjectId: string;
  subjectName?: string;
  teacherId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  active: boolean;
}

export interface StudentReportResponse {
  student: StudentSummaryRecord;
  grade: StudentGradeRecord | null;
  marks: StudentMarkRecord[];
  attendance: StudentAttendanceRecord[];
}

@Injectable({ providedIn: 'root' })
export class StudentReportService {
  private readonly api = inject(ApiService);

  getReport() {
    return this.api.get<StudentReportResponse>('/student/me/report');
  }

  listMarks() {
    return this.api.get<{ items: StudentMarkRecord[] }>('/student/me/marks');
  }

  listAttendance() {
    return this.api.get<{ items: StudentAttendanceRecord[] }>(
      '/student/me/attendance',
    );
  }

  toErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? error.message ?? 'Request failed.';
    }

    return 'Request failed.';
  }
}
