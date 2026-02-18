import type { Database, User, Class, Booking, Attendance, Notification } from "./types"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

const defaultDb: Database = {
  users: [],
  classes: [],
  bookings: [],
  attendance: [],
  notifications: [],
}

let db: Database = { ...defaultDb, users: [], classes: [], bookings: [], attendance: [], notifications: [] }
let seeded = false

export function getDb(): Database {
  if (!seeded) {
    seedDatabase()
    seeded = true
  }
  return db
}

function seedDatabase() {
  const now = new Date().toISOString()

  // Admin
  db.users.push({
    id: uuidv4(),
    name: "Admin User",
    email: "admin@system.com",
    password: bcrypt.hashSync("admin123", 10),
    role: "admin",
    faceDescriptor: null,
    profilePicture: null,
    createdAt: now,
  })

  // Lecturers
  const lec1Id = uuidv4()
  const lec2Id = uuidv4()
  db.users.push(
    {
      id: lec1Id,
      name: "Dr. Sarah Johnson",
      email: "sarah@university.com",
      password: bcrypt.hashSync("lecturer123", 10),
      role: "lecturer",
      faceDescriptor: null,
      profilePicture: null,
      createdAt: now,
    },
    {
      id: lec2Id,
      name: "Prof. James Smith",
      email: "james@university.com",
      password: bcrypt.hashSync("lecturer123", 10),
      role: "lecturer",
      faceDescriptor: null,
      profilePicture: null,
      createdAt: now,
    }
  )

  // Students
  const studentIds: string[] = []
  const students = [
    { name: "Alice Chen", email: "alice@student.com" },
    { name: "Bob Martinez", email: "bob@student.com" },
    { name: "Carol Williams", email: "carol@student.com" },
    { name: "David Park", email: "david@student.com" },
    { name: "Emma Brown", email: "emma@student.com" },
  ]

  for (const s of students) {
    const sid = uuidv4()
    studentIds.push(sid)
    db.users.push({
      id: sid,
      name: s.name,
      email: s.email,
      password: bcrypt.hashSync("student123", 10),
      role: "student",
      faceDescriptor: null,
      profilePicture: null,
      createdAt: now,
    })
  }

  // Admin ID
  const adminId = db.users[0].id

  // Classes
  const class1Id = uuidv4()
  const class2Id = uuidv4()
  const class3Id = uuidv4()

  db.classes.push(
    {
      id: class1Id,
      name: "Introduction to Computer Science",
      description: "Fundamentals of programming and computational thinking",
      capacity: 30,
      room: "Room A101",
      createdBy: adminId,
      createdAt: now,
    },
    {
      id: class2Id,
      name: "Data Structures & Algorithms",
      description: "Advanced data structures, sorting, and graph algorithms",
      capacity: 25,
      room: "Room B202",
      createdBy: adminId,
      createdAt: now,
    },
    {
      id: class3Id,
      name: "Machine Learning Basics",
      description: "Introduction to supervised and unsupervised learning",
      capacity: 20,
      room: "Lab C303",
      createdBy: adminId,
      createdAt: now,
    }
  )

  // Bookings
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date()
  dayAfter.setDate(dayAfter.getDate() + 2)

  const booking1Id = uuidv4()
  const booking2Id = uuidv4()

  db.bookings.push(
    {
      id: booking1Id,
      classId: class1Id,
      lecturerId: lec1Id,
      date: tomorrow.toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "11:00",
      status: "scheduled",
      createdAt: now,
    },
    {
      id: booking2Id,
      classId: class2Id,
      lecturerId: lec2Id,
      date: dayAfter.toISOString().split("T")[0],
      startTime: "14:00",
      endTime: "16:00",
      status: "scheduled",
      createdAt: now,
    }
  )

  // Sample attendance
  db.attendance.push(
    {
      id: uuidv4(),
      bookingId: booking1Id,
      studentId: studentIds[0],
      markedAt: now,
      method: "manual",
    },
    {
      id: uuidv4(),
      bookingId: booking1Id,
      studentId: studentIds[1],
      markedAt: now,
      method: "manual",
    }
  )

  // Sample notifications
  for (const sid of studentIds.slice(0, 3)) {
    db.notifications.push({
      id: uuidv4(),
      userId: sid,
      title: "New Class Scheduled",
      message: `A new session of "Introduction to Computer Science" has been scheduled for ${tomorrow.toISOString().split("T")[0]} at 09:00.`,
      type: "booking",
      read: false,
      bookingId: booking1Id,
      createdAt: now,
    })
  }
}

// --- CRUD Helpers ---

export function findUserByEmail(email: string): User | undefined {
  return getDb().users.find((u) => u.email === email)
}

export function findUserById(id: string): User | undefined {
  return getDb().users.find((u) => u.id === id)
}

export function getAllUsers(): User[] {
  return getDb().users
}

export function createUser(user: Omit<User, "id" | "createdAt">): User {
  const newUser: User = {
    ...user,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
  getDb().users.push(newUser)
  return newUser
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const d = getDb()
  const idx = d.users.findIndex((u) => u.id === id)
  if (idx === -1) return null
  d.users[idx] = { ...d.users[idx], ...updates }
  return d.users[idx]
}

export function deleteUser(id: string): boolean {
  const d = getDb()
  const idx = d.users.findIndex((u) => u.id === id)
  if (idx === -1) return false
  d.users.splice(idx, 1)
  return true
}

// Classes
export function getAllClasses(): Class[] {
  return getDb().classes
}

export function findClassById(id: string): Class | undefined {
  return getDb().classes.find((c) => c.id === id)
}

export function createClass(cls: Omit<Class, "id" | "createdAt">): Class {
  const newClass: Class = {
    ...cls,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
  getDb().classes.push(newClass)
  return newClass
}

export function updateClass(id: string, updates: Partial<Class>): Class | null {
  const d = getDb()
  const idx = d.classes.findIndex((c) => c.id === id)
  if (idx === -1) return null
  d.classes[idx] = { ...d.classes[idx], ...updates }
  return d.classes[idx]
}

export function deleteClass(id: string): boolean {
  const d = getDb()
  const idx = d.classes.findIndex((c) => c.id === id)
  if (idx === -1) return false
  d.classes.splice(idx, 1)
  return true
}

// Bookings
export function getAllBookings(): Booking[] {
  return getDb().bookings
}

export function getBookingsByLecturer(lecturerId: string): Booking[] {
  return getDb().bookings.filter((b) => b.lecturerId === lecturerId)
}

export function findBookingById(id: string): Booking | undefined {
  return getDb().bookings.find((b) => b.id === id)
}

export function createBooking(booking: Omit<Booking, "id" | "createdAt">): Booking {
  const newBooking: Booking = {
    ...booking,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
  getDb().bookings.push(newBooking)
  return newBooking
}

export function updateBooking(id: string, updates: Partial<Booking>): Booking | null {
  const d = getDb()
  const idx = d.bookings.findIndex((b) => b.id === id)
  if (idx === -1) return null
  d.bookings[idx] = { ...d.bookings[idx], ...updates }
  return d.bookings[idx]
}

// Attendance
export function getAttendanceByBooking(bookingId: string): Attendance[] {
  return getDb().attendance.filter((a) => a.bookingId === bookingId)
}

export function getAttendanceByStudent(studentId: string): Attendance[] {
  return getDb().attendance.filter((a) => a.studentId === studentId)
}

export function createAttendance(att: Omit<Attendance, "id">): Attendance {
  const existing = getDb().attendance.find(
    (a) => a.bookingId === att.bookingId && a.studentId === att.studentId
  )
  if (existing) return existing
  const newAtt: Attendance = { ...att, id: uuidv4() }
  getDb().attendance.push(newAtt)
  return newAtt
}

// Notifications
export function getNotificationsByUser(userId: string): Notification[] {
  return getDb().notifications.filter((n) => n.userId === userId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function createNotification(notif: Omit<Notification, "id" | "createdAt">): Notification {
  const newNotif: Notification = {
    ...notif,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
  getDb().notifications.push(newNotif)
  return newNotif
}

export function markNotificationRead(id: string): boolean {
  const d = getDb()
  const notif = d.notifications.find((n) => n.id === id)
  if (!notif) return false
  notif.read = true
  return true
}

export function notifyStudentsOfBooking(booking: Booking, cls: Class, type: "booking" | "cancellation" | "update") {
  const students = getDb().users.filter((u) => u.role === "student")
  const titles: Record<string, string> = {
    booking: "New Class Scheduled",
    cancellation: "Class Cancelled",
    update: "Class Updated",
  }
  const messages: Record<string, string> = {
    booking: `A new session of "${cls.name}" has been scheduled for ${booking.date} at ${booking.startTime}.`,
    cancellation: `The session of "${cls.name}" on ${booking.date} at ${booking.startTime} has been cancelled.`,
    update: `The session of "${cls.name}" on ${booking.date} has been updated.`,
  }
  for (const student of students) {
    createNotification({
      userId: student.id,
      title: titles[type],
      message: messages[type],
      type,
      read: false,
      bookingId: booking.id,
    })
  }
}
