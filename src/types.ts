export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  semester: number;
  batch: string;
  gender?: string;
  category?: string;
  quota?: string;
  scheme?: string;
  cgpa?: number;
  passoutYear?: string;
  obtainClass?: string;
  status: 'ACTIVE' | 'PASSOUT' | 'DETAINED';
}

export interface Result {
  id: string;
  studentId: string;
  courseCode: string;
  courseName: string;
  internalMarks: number;
  externalMarks: number;
  total: number;
  grade: string;
  semester: number;
  examDate: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
