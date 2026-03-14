import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ApiService } from '../../../core/services/api.service';

export interface TeacherAssignmentRecord {
  id: string;
  teacherId: string;
  gradeId: string;
  gradeName?: string;
  subjectId: string;
  subjectName?: string;
  status: 'active' | 'inactive';
}

export interface TeacherStudentRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Student';
  status: 'active' | 'inactive';
  studentIdentifier?: string;
}

export interface TeacherMarkRecord {
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

export interface TeacherAttendanceRecord {
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

export interface TeacherDashboardResponse {
  assignments: TeacherAssignmentRecord[];
  students: TeacherStudentRecord[];
  recentMarks: TeacherMarkRecord[];
  recentAttendance: TeacherAttendanceRecord[];
}

@Injectable({ providedIn: 'root' })
export class TeacherPerformanceService {
  private readonly api = inject(ApiService);

  getDashboard() {
    return this.api.get<TeacherDashboardResponse>('/teacher/dashboard');
  }

  listStudents() {
    return this.api.get<{ items: TeacherStudentRecord[] }>('/teacher/students');
  }

  listMarks() {
    return this.api.get<{ items: TeacherMarkRecord[] }>('/teacher/marks');
  }

  createMark(payload: {
    studentId: string;
    subjectId: string;
    gradeId: string;
    assessmentType: string;
    score: number;
    maxScore: number;
    term: string;
    status: 'draft' | 'published';
  }) {
    return this.api.post<{ item: TeacherMarkRecord }>(
      '/teacher/marks',
      payload,
    );
  }

  updateMark(
    markId: string,
    payload: Partial<{
      assessmentType: string;
      score: number;
      maxScore: number;
      term: string;
      status: 'draft' | 'published';
    }>,
  ) {
    return this.api.patch<{ item: TeacherMarkRecord }>(
      `/teacher/marks/${markId}`,
      payload,
    );
  }

  listAttendance() {
    return this.api.get<{ items: TeacherAttendanceRecord[] }>(
      '/teacher/attendance',
    );
  }

  createAttendance(payload: {
    studentId: string;
    gradeId: string;
    subjectId: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }) {
    return this.api.post<{ item: TeacherAttendanceRecord }>(
      '/teacher/attendance',
      payload,
    );
  }

  updateAttendance(
    attendanceId: string,
    payload: Partial<{
      date: string;
      status: 'present' | 'absent' | 'late' | 'excused';
      notes?: string;
    }>,
  ) {
    return this.api.patch<{ item: TeacherAttendanceRecord }>(
      `/teacher/attendance/${attendanceId}`,
      payload,
    );
  }

  toErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? error.message ?? 'Request failed.';
    }

    return 'Request failed.';
  }
}
