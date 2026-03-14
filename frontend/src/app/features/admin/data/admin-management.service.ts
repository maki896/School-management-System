import { Injectable, inject } from '@angular/core';
import { forkJoin } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';

interface ListResponse<T> {
  items: T[];
}

interface DetailResponse<T> {
  item: T;
}

export interface TeacherRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Teacher';
  status: 'active' | 'inactive';
  staffIdentifier?: string;
}

export interface StudentRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Student';
  status: 'active' | 'inactive';
  studentIdentifier?: string;
}

export interface SubjectRecord {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface GradeRecord {
  id: string;
  name: string;
  academicYear: string;
  status: 'active' | 'inactive';
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  studentName?: string;
  gradeId: string;
  gradeName?: string;
  subjectId: string;
  subjectName?: string;
  status: 'active' | 'archived';
}

export interface TeachingAssignmentRecord {
  id: string;
  teacherId: string;
  teacherName?: string;
  gradeId: string;
  gradeName?: string;
  subjectId: string;
  subjectName?: string;
  status: 'active' | 'archived';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  gradeId: string;
  gradeName?: string;
  subjectId?: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminManagementService {
  private readonly api = inject(ApiService);

  listTeachers() {
    return this.api.get<ListResponse<TeacherRecord>>('/admin/teachers');
  }

  createTeacher(
    payload: Omit<TeacherRecord, 'id' | 'role' | 'status'> & {
      password?: string;
    },
  ) {
    return this.api.post<DetailResponse<TeacherRecord>>(
      '/admin/teachers',
      payload,
    );
  }

  updateTeacher(
    teacherId: string,
    payload: Partial<TeacherRecord> & { password?: string },
  ) {
    return this.api.patch<DetailResponse<TeacherRecord>>(
      `/admin/teachers/${teacherId}`,
      payload,
    );
  }

  deactivateTeacher(teacherId: string) {
    return this.api.delete<void>(`/admin/teachers/${teacherId}`);
  }

  listStudents() {
    return this.api.get<ListResponse<StudentRecord>>('/admin/students');
  }

  createStudent(
    payload: Omit<StudentRecord, 'id' | 'role' | 'status'> & {
      password?: string;
    },
  ) {
    return this.api.post<DetailResponse<StudentRecord>>(
      '/admin/students',
      payload,
    );
  }

  updateStudent(
    studentId: string,
    payload: Partial<StudentRecord> & { password?: string },
  ) {
    return this.api.patch<DetailResponse<StudentRecord>>(
      `/admin/students/${studentId}`,
      payload,
    );
  }

  deactivateStudent(studentId: string) {
    return this.api.delete<void>(`/admin/students/${studentId}`);
  }

  listSubjects() {
    return this.api.get<ListResponse<SubjectRecord>>('/admin/subjects');
  }

  createSubject(payload: Omit<SubjectRecord, 'id' | 'status'>) {
    return this.api.post<DetailResponse<SubjectRecord>>(
      '/admin/subjects',
      payload,
    );
  }

  updateSubject(subjectId: string, payload: Partial<SubjectRecord>) {
    return this.api.patch<DetailResponse<SubjectRecord>>(
      `/admin/subjects/${subjectId}`,
      payload,
    );
  }

  deactivateSubject(subjectId: string) {
    return this.api.delete<void>(`/admin/subjects/${subjectId}`);
  }

  listGrades() {
    return this.api.get<ListResponse<GradeRecord>>('/admin/grades');
  }

  createGrade(payload: Omit<GradeRecord, 'id' | 'status'>) {
    return this.api.post<DetailResponse<GradeRecord>>('/admin/grades', payload);
  }

  updateGrade(gradeId: string, payload: Partial<GradeRecord>) {
    return this.api.patch<DetailResponse<GradeRecord>>(
      `/admin/grades/${gradeId}`,
      payload,
    );
  }

  deactivateGrade(gradeId: string) {
    return this.api.delete<void>(`/admin/grades/${gradeId}`);
  }

  listEnrollments() {
    return this.api.get<ListResponse<EnrollmentRecord>>('/admin/enrollments');
  }

  createEnrollment(
    payload: Pick<EnrollmentRecord, 'studentId' | 'gradeId' | 'subjectId'>,
  ) {
    return this.api.post<DetailResponse<EnrollmentRecord>>(
      '/admin/enrollments',
      payload,
    );
  }

  updateEnrollment(enrollmentId: string, payload: Partial<EnrollmentRecord>) {
    return this.api.patch<DetailResponse<EnrollmentRecord>>(
      `/admin/enrollments/${enrollmentId}`,
      payload,
    );
  }

  archiveEnrollment(enrollmentId: string) {
    return this.api.delete<void>(`/admin/enrollments/${enrollmentId}`);
  }

  listAssignments() {
    return this.api.get<ListResponse<TeachingAssignmentRecord>>(
      '/admin/teaching-assignments',
    );
  }

  createAssignment(
    payload: Pick<
      TeachingAssignmentRecord,
      'teacherId' | 'gradeId' | 'subjectId'
    >,
  ) {
    return this.api.post<DetailResponse<TeachingAssignmentRecord>>(
      '/admin/teaching-assignments',
      payload,
    );
  }

  updateAssignment(
    assignmentId: string,
    payload: Partial<TeachingAssignmentRecord>,
  ) {
    return this.api.patch<DetailResponse<TeachingAssignmentRecord>>(
      `/admin/teaching-assignments/${assignmentId}`,
      payload,
    );
  }

  archiveAssignment(assignmentId: string) {
    return this.api.delete<void>(`/admin/teaching-assignments/${assignmentId}`);
  }

  listAttendance() {
    return this.api.get<ListResponse<AttendanceRecord>>('/admin/attendance');
  }

  createAttendance(
    payload: Omit<
      AttendanceRecord,
      | 'id'
      | 'studentName'
      | 'gradeName'
      | 'subjectName'
      | 'teacherName'
      | 'active'
    >,
  ) {
    return this.api.post<DetailResponse<AttendanceRecord>>(
      '/admin/attendance',
      payload,
    );
  }

  updateAttendance(attendanceId: string, payload: Partial<AttendanceRecord>) {
    return this.api.patch<DetailResponse<AttendanceRecord>>(
      `/admin/attendance/${attendanceId}`,
      payload,
    );
  }

  deactivateAttendance(attendanceId: string) {
    return this.api.delete<void>(`/admin/attendance/${attendanceId}`);
  }

  loadRelationshipLookups() {
    return forkJoin({
      teachers: this.listTeachers(),
      students: this.listStudents(),
      subjects: this.listSubjects(),
      grades: this.listGrades(),
    });
  }

  toErrorMessage(error: unknown): string {
    const candidate = error as { error?: { message?: string } };
    return candidate.error?.message ?? 'Unable to complete the request.';
  }
}
