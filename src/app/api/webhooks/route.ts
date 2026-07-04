import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifications, students, fees, attendance, results } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendEmail } from '@/lib/email'

// POST /api/webhooks - Handle incoming webhooks from external services
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data, timestamp, signature } = body

    // Validate webhook payload
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Invalid webhook payload. Type and data are required.' },
        { status: 400 }
      )
    }

    console.log(`📨 Webhook received: ${type} at ${timestamp || new Date().toISOString()}`)

    // Route webhook to appropriate handler
    switch (type) {
      // Fee/Payment webhooks
      case 'fee.payment.received':
        await handleFeePaymentReceived(data)
        break
      case 'fee.payment.failed':
        await handleFeePaymentFailed(data)
        break
      case 'fee.reminder':
        await handleFeeReminder(data)
        break

      // Student webhooks
      case 'student.admission':
        await handleStudentAdmission(data)
        break
      case 'student.transfer':
        await handleStudentTransfer(data)
        break
      case 'student.graduation':
        await handleStudentGraduation(data)
        break

      // Attendance webhooks
      case 'attendance.alert':
        await handleAttendanceAlert(data)
        break
      case 'attendance.report':
        await handleAttendanceReport(data)
        break

      // Exam/Result webhooks
      case 'exam.result.published':
        await handleExamResultPublished(data)
        break
      case 'exam.scheduled':
        await handleExamScheduled(data)
        break

      // Event webhooks
      case 'event.created':
        await handleEventCreated(data)
        break
      case 'event.reminder':
        await handleEventReminder(data)
        break

      // Library webhooks
      case 'library.book.overdue':
        await handleBookOverdue(data)
        break
      case 'library.book.returned':
        await handleBookReturned(data)
        break

      // System webhooks
      case 'system.backup.completed':
        await handleBackupCompleted(data)
        break
      case 'system.error':
        await handleSystemError(data)
        break

      // General notification
      case 'notification.send':
        await handleGeneralNotification(data)
        break

      default:
        console.warn(`Unknown webhook type: ${type}`)
        return NextResponse.json(
          { error: `Unknown webhook type: ${type}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Webhook '${type}' processed successfully`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error processing webhook' },
      { status: 500 }
    )
  }
}

// GET /api/webhooks - Health check endpoint
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    service: 'School MIS Webhook Handler',
    timestamp: new Date().toISOString(),
    supportedWebhooks: [
      'fee.payment.received',
      'fee.payment.failed',
      'fee.reminder',
      'student.admission',
      'student.transfer',
      'student.graduation',
      'attendance.alert',
      'attendance.report',
      'exam.result.published',
      'exam.scheduled',
      'event.created',
      'event.reminder',
      'library.book.overdue',
      'library.book.returned',
      'system.backup.completed',
      'system.error',
      'notification.send',
    ],
  })
}

// ============================================
// Webhook Handlers
// ============================================

// Fee Payment Handlers
async function handleFeePaymentReceived(data: any) {
  const { studentId, amount, transactionId, paymentMethod, feeId } = data

  // Create notification
  if (studentId) {
    const student = await db.query.students.findFirst({
      where: eq(students.id, studentId),
    })

    if (student?.userId) {
      await db.insert(notifications).values({
        userId: student.userId,
        title: 'Payment Received',
        message: `Payment of $${amount} received${transactionId ? ` (Txn: ${transactionId})` : ''}`,
        type: 'fee',
        link: feeId ? `/fees/${feeId}` : '/fees',
      })
    }
  }

  // Send email receipt if email provided
  if (data.email) {
    await sendEmail({
      to: data.email,
      subject: 'Payment Receipt - School MIS',
      html: `
        <h1>Payment Receipt</h1>
        <p>Amount Paid: $${amount}</p>
        <p>Transaction ID: ${transactionId || 'N/A'}</p>
        <p>Payment Method: ${paymentMethod || 'N/A'}</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      `,
    })
  }

  console.log(`✅ Fee payment of $${amount} processed for student ${studentId}`)
}

async function handleFeePaymentFailed(data: any) {
  const { studentId, amount, reason } = data

  if (studentId) {
    const student = await db.query.students.findFirst({
      where: eq(students.id, studentId),
    })

    if (student?.userId) {
      await db.insert(notifications).values({
        userId: student.userId,
        title: 'Payment Failed',
        message: `Payment of $${amount} failed. Reason: ${reason || 'Unknown'}`,
        type: 'fee',
        link: '/fees',
      })
    }
  }

  console.log(`❌ Fee payment of $${amount} failed for student ${studentId}`)
}

async function handleFeeReminder(data: any) {
  const { studentId, studentName, parentEmail, amount, dueDate } = data

  // Create notification
  if (studentId) {
    const student = await db.query.students.findFirst({
      where: eq(students.id, studentId),
    })

    if (student?.userId) {
      await db.insert(notifications).values({
        userId: student.userId,
        title: 'Fee Payment Reminder',
        message: `Reminder: Fee payment of $${amount} is due by ${dueDate}`,
        type: 'fee',
        link: '/fees',
      })
    }
  }

  // Send email reminder
  if (parentEmail) {
    await sendEmail({
      to: parentEmail,
      subject: 'Fee Payment Reminder - School MIS',
      html: `
        <h1>Fee Payment Reminder</h1>
        <p>Dear Parent,</p>
        <p>This is a reminder that the fee payment of <strong>$${amount}</strong> for <strong>${studentName}</strong> is due by <strong>${dueDate}</strong>.</p>
        <p>Please make the payment at your earliest convenience.</p>
      `,
    })
  }

  console.log(`📧 Fee reminder sent for student ${studentName}`)
}

// Student Handlers
async function handleStudentAdmission(data: any) {
  const { studentId, studentName, email, password } = data

  // Create notification for admin
  await db.insert(notifications).values({
    userId: data.adminUserId || 'admin',
    title: 'New Student Admission',
    message: `${studentName} has been admitted successfully`,
    type: 'enrollment',
    link: studentId ? `/students/${studentId}` : '/students',
  })

  // Send welcome email
  if (email) {
    await sendEmail({
      to: email,
      subject: 'Welcome to School MIS',
      html: `
        <h1>Welcome to School MIS!</h1>
        <p>Dear ${studentName},</p>
        <p>Your admission has been confirmed.</p>
        ${password ? `<p>Your login credentials:</p><p>Email: ${email}<br>Password: ${password}</p>` : ''}
        <p>Please login to access your account.</p>
      `,
    })
  }

  console.log(`🎓 New student admitted: ${studentName}`)
}

async function handleStudentTransfer(data: any) {
  const { studentId, studentName, fromClass, toClass } = data

  await db.insert(notifications).values({
    userId: data.adminUserId || 'admin',
    title: 'Student Transfer',
    message: `${studentName} has been transferred from ${fromClass} to ${toClass}`,
    type: 'enrollment',
    link: studentId ? `/students/${studentId}` : '/students',
  })

  console.log(`🔄 Student transferred: ${studentName} from ${fromClass} to ${toClass}`)
}

async function handleStudentGraduation(data: any) {
  const { studentId, studentName } = data

  await db.insert(notifications).values({
    userId: data.adminUserId || 'admin',
    title: 'Student Graduation',
    message: `${studentName} has graduated`,
    type: 'enrollment',
    link: studentId ? `/students/${studentId}` : '/students',
  })

  console.log(`🎉 Student graduated: ${studentName}`)
}

// Attendance Handlers
async function handleAttendanceAlert(data: any) {
  const { studentId, studentName, parentId, parentEmail, date, status } = data

  // Create notification for parent
  if (parentId) {
    await db.insert(notifications).values({
      userId: parentId,
      title: 'Attendance Alert',
      message: `${studentName} was marked ${status} on ${date}`,
      type: 'attendance',
      link: '/attendance',
    })
  }

  // Send email alert
  if (parentEmail) {
    await sendEmail({
      to: parentEmail,
      subject: `Attendance Alert - ${studentName}`,
      html: `
        <h1>Attendance Alert</h1>
        <p>Dear Parent,</p>
        <p>This is to inform you that <strong>${studentName}</strong> was marked <strong>${status}</strong> on <strong>${date}</strong>.</p>
      `,
    })
  }

  console.log(`📋 Attendance alert for ${studentName}: ${status}`)
}

async function handleAttendanceReport(data: any) {
  const { classId, date, presentCount, absentCount, lateCount, totalStudents } = data

  await db.insert(notifications).values({
    userId: data.adminUserId || 'admin',
    title: 'Daily Attendance Report',
    message: `Attendance for ${date}: ${presentCount} present, ${absentCount} absent, ${lateCount} late out of ${totalStudents} students`,
    type: 'attendance',
    link: '/attendance',
  })

  console.log(`📊 Attendance report generated for ${date}`)
}

// Exam Handlers
async function handleExamResultPublished(data: any) {
  const { examId, examName, classId, subjectName } = data

  // Notify all students in the class
  if (classId) {
    const classStudents = await db.query.students.findMany({
      where: eq(students.classId, classId),
    })

    for (const student of classStudents) {
      if (student.userId) {
        await db.insert(notifications).values({
          userId: student.userId,
          title: 'Results Published',
          message: `${examName} results for ${subjectName} have been published`,
          type: 'result',
          link: '/results',
        })
      }
    }
  }

  console.log(`📝 Results published for ${examName} - ${subjectName}`)
}

async function handleExamScheduled(data: any) {
  const { examName, subjectName, classId, date, time } = data

  if (classId) {
    const classStudents = await db.query.students.findMany({
      where: eq(students.classId, classId),
    })

    for (const student of classStudents) {
      if (student.userId) {
        await db.insert(notifications).values({
          userId: student.userId,
          title: 'Exam Scheduled',
          message: `${examName} for ${subjectName} scheduled on ${date} at ${time}`,
          type: 'exam',
          link: '/exams',
        })
      }
    }
  }

  console.log(`📅 Exam scheduled: ${examName} on ${date}`)
}

// Event Handlers
async function handleEventCreated(data: any) {
  const { eventName, date, venue } = data

  // Notify all users (simplified - in real app, notify relevant users)
  await db.insert(notifications).values({
    userId: 'admin', // Could be broadcast to all users
    title: 'New Event',
    message: `${eventName} scheduled on ${date} at ${venue || 'TBA'}`,
    type: 'event',
    link: '/events',
  })

  console.log(`📅 Event created: ${eventName}`)
}

async function handleEventReminder(data: any) {
  const { eventName, date, userId } = data

  if (userId) {
    await db.insert(notifications).values({
      userId: userId,
      title: 'Event Reminder',
      message: `Reminder: ${eventName} is scheduled for ${date}`,
      type: 'event',
      link: '/events',
    })
  }

  console.log(`⏰ Event reminder sent for ${eventName}`)
}

// Library Handlers
async function handleBookOverdue(data: any) {
  const { bookTitle, borrowerName, borrowerId, dueDate, daysOverdue, fine } = data

  if (borrowerId) {
    await db.insert(notifications).values({
      userId: borrowerId,
      title: 'Book Overdue',
      message: `"${bookTitle}" is ${daysOverdue} days overdue. Fine: $${fine}`,
      type: 'library',
      link: '/library',
    })
  }

  console.log(`📚 Overdue book: ${bookTitle} - ${daysOverdue} days`)
}

async function handleBookReturned(data: any) {
  const { bookTitle, borrowerName, fine } = data

  console.log(`📚 Book returned: ${bookTitle}${fine > 0 ? ` with fine: $${fine}` : ''}`)
}

// System Handlers
async function handleBackupCompleted(data: any) {
  const { filename, size, timestamp } = data

  await db.insert(notifications).values({
    userId: 'admin',
    title: 'Database Backup Completed',
    message: `Backup "${filename}" (${size}) completed at ${timestamp}`,
    type: 'system',
  })

  console.log(`💾 Database backup completed: ${filename}`)
}

async function handleSystemError(data: any) {
  const { error, component, severity } = data

  await db.insert(notifications).values({
    userId: 'admin',
    title: `System Error - ${severity || 'Warning'}`,
    message: `Error in ${component}: ${error}`,
    type: 'system',
  })

  console.error(`⚠️ System error in ${component}: ${error}`)
}

// General Notification Handler
async function handleGeneralNotification(data: any) {
  const { userId, title, message, type, link } = data

  if (userId) {
    await db.insert(notifications).values({
      userId,
      title: title || 'Notification',
      message: message || '',
      type: type || 'general',
      link: link || null,
    })
  }

  console.log(`🔔 Notification sent to user ${userId}: ${title}`)
}