import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER!

export async function sendSMS(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      from: FROM_NUMBER,
      to,
    })
    return { success: true, sid: message.sid }
  } catch (error: any) {
    console.error('SMS send error:', error.message)
    return { success: false, error: error.message }
  }
}

export async function sendWhatsApp(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      from: `whatsapp:${FROM_NUMBER}`,
      to: `whatsapp:${to}`,
    })
    return { success: true, sid: message.sid }
  } catch (error: any) {
    console.error('WhatsApp send error:', error.message)
    return { success: false, error: error.message }
  }
}

// Reminder message templates
export const REMINDER_TEMPLATES = {
  threeDaysBefore: (name: string, amount: number, dueDate: string) =>
    `Hi ${name}, just a friendly reminder that your rent of $${amount.toFixed(2)} is due on ${dueDate}. Please ensure payment is made on time. Thank you! - TinyLandlord`,

  oneDayBefore: (name: string, amount: number) =>
    `Hi ${name}, your rent payment of $${amount.toFixed(2)} is due TOMORROW. Please make payment to avoid late fees. - TinyLandlord`,

  dueToday: (name: string, amount: number) =>
    `Hi ${name}, your rent payment of $${amount.toFixed(2)} is DUE TODAY. Please submit payment as soon as possible. - TinyLandlord`,

  overdue: (name: string, amount: number, daysLate: number, lateFee: number) =>
    `Hi ${name}, your rent of $${amount.toFixed(2)} is ${daysLate} day(s) overdue. A late fee of $${lateFee.toFixed(2)} has been applied. Total due: $${(amount + lateFee).toFixed(2)}. Please contact us immediately. - TinyLandlord`,

  leaseRenewal: (name: string, leaseEnd: string) =>
    `Hi ${name}, your lease expires on ${leaseEnd}. Please contact us to discuss renewal options. - TinyLandlord`,
}
