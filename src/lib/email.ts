// Email service - requires RESEND_API_KEY in production

const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // Skip if no API key configured
  if (!RESEND_API_KEY || RESEND_API_KEY === 're_placeholder') {
    console.log('[Email] Skipped - No API key configured:', { to, subject })
    return { success: true, message: 'Email skipped - no API key' }
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(RESEND_API_KEY)
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@school.com',
      to,
      subject,
      html,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string, name: string, password: string, role: string) {
  const html = '<div><h1>Welcome to School MIS!</h1><p>Dear ' + name + ',</p><p>Your account has been created. Email: ' + email + ', Password: ' + password + ', Role: ' + role + '</p></div>'
  return sendEmail({ to: email, subject: 'Welcome to School MIS', html })
}

export async function sendFeeReminder(email: string, studentName: string, amount: number, dueDate: string) {
  const html = '<div><h1>Fee Payment Reminder</h1><p>Dear Parent,</p><p>Fee of $' + amount + ' for ' + studentName + ' is due by ' + dueDate + '.</p></div>'
  return sendEmail({ to: email, subject: 'Fee Payment Reminder', html })
}

export async function sendAttendanceAlert(email: string, studentName: string, date: string, status: string) {
  const html = '<div><h1>Attendance Alert</h1><p>' + studentName + ' was marked ' + status + ' on ' + date + '.</p></div>'
  return sendEmail({ to: email, subject: 'Attendance Alert', html })
}
