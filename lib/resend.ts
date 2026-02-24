import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'TinyLandlord <noreply@tinylandlord.com>'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
    if (error) return { success: false, error: error.message }
    return { success: true, id: data?.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export function rentReminderEmailHTML({
  tenantName,
  amount,
  dueDate,
  landlordName,
  daysUntilDue,
  lateFeeAmount,
}: {
  tenantName: string
  amount: number
  dueDate: string
  landlordName: string
  daysUntilDue: number
  lateFeeAmount?: number
}) {
  const isOverdue = daysUntilDue < 0
  const subject = isOverdue
    ? `⚠️ Overdue Rent Notice - Action Required`
    : daysUntilDue === 0
    ? `🏠 Rent Due Today`
    : `📅 Rent Due in ${daysUntilDue} Day(s)`

  return {
    subject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: ${isOverdue ? '#ef4444' : '#10b981'}; color: white; padding: 32px 40px; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0; opacity: 0.9; }
    .body { padding: 40px; }
    .amount-box { background: #f8fafc; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; }
    .amount { font-size: 48px; font-weight: 800; color: #1e293b; }
    .amount-label { color: #64748b; font-size: 14px; margin-top: 4px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-label { color: #64748b; }
    .detail-value { font-weight: 600; color: #1e293b; }
    .footer { padding: 24px 40px; background: #f8fafc; color: #94a3b8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isOverdue ? '⚠️ Overdue Rent Notice' : '🏠 Rent Reminder'}</h1>
      <p>From ${landlordName}</p>
    </div>
    <div class="body">
      <p>Hi ${tenantName},</p>
      <p>${
        isOverdue
          ? `Your rent payment is <strong>${Math.abs(daysUntilDue)} day(s) overdue</strong>. Please make payment immediately to avoid additional fees.`
          : daysUntilDue === 0
          ? 'Your rent payment is <strong>due today</strong>.'
          : `Your rent payment is due in <strong>${daysUntilDue} day(s)</strong>.`
      }</p>
      <div class="amount-box">
        <div class="amount">$${amount.toFixed(2)}</div>
        <div class="amount-label">Rent Amount</div>
        ${lateFeeAmount && lateFeeAmount > 0 ? `<div class="amount-label" style="color: #ef4444; margin-top: 8px;">+ $${lateFeeAmount.toFixed(2)} late fee = $${(amount + lateFeeAmount).toFixed(2)} total</div>` : ''}
      </div>
      <div class="detail-row">
        <span class="detail-label">Due Date</span>
        <span class="detail-value">${dueDate}</span>
      </div>
      <div class="detail-row" style="border: none;">
        <span class="detail-label">From</span>
        <span class="detail-value">${landlordName}</span>
      </div>
    </div>
    <div class="footer">
      <p>Powered by TinyLandlord. If you have questions, please contact your landlord directly.</p>
    </div>
  </div>
</body>
</html>
  `,
  }
}
