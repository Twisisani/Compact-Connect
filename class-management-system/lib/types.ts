export type UserRole = "admin" | "lecturer" | "student"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  faceDescriptor: number[] | null
  profilePicture: string | null
  createdAt: string
}

export interface Class {
  id: string
  name: string
  description: string
  capacity: number
  room: string
  createdBy: string
  createdAt: string
}

export interface Booking {
  id: string
  classId: string
  lecturerId: string
  date: string
  startTime: string
  endTime: string
  status: "scheduled" | "cancelled"
  createdAt: string
}

export interface Attendance {
  id: string
  bookingId: string
  studentId: string
  markedAt: string
  method: "manual" | "face"
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "booking" | "cancellation" | "update" | "general"
  read: boolean
  bookingId: string | null
  createdAt: string
}

export interface Database {
  users: User[]
  classes: Class[]
  bookings: Booking[]
  attendance: Attendance[]
  notifications: Notification[]
}

export interface AuthPayload {
  userId: string
  role: UserRole
  email: string
  name: string
}

export type SafeUser = Omit<User, "password" | "faceDescriptor">
