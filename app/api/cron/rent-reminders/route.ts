import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendSMS, REMINDER_TEMPLATES } from '@/lib/twilio'
import { sendEmail, rentReminderEmailHTML } from '@/lib/resend'
import { getDaysUntilDue, withRetry } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]
  
  try {
    // Get all pending payments within reminder window (-7 to +3 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    const threeDaysAhead = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    const { data: payments, error } = await supabaseAdmin
      .from('rent_payments')
      .select(`
        *,
        tenants(name, email, phone),
        properties(rent_due_day, late_fee_amount, late_fee_grace_period),
        landlords(name, subscription_tier)
      `)
      .in('status', ['pending', 'late'])
      .gte('due_date', sevenDaysAgo)
      .lte('due_date', threeDaysAhead)

    if (error) throw error

    const results = { sent: 0, failed: 0, skipped: 0 }

    for (const payment of payments ?? []) {
      const tenant = payment.tenants as any
      const property = payment.properties as any
      const landlord = payment.landlords as any
      const daysUntil = getDaysUntilDue(payment.due_date)

      // Determine if we should send a reminder based on days until due
      const shouldSend = daysUntil === 3 || daysUntil === 1 || daysUntil === 0 || daysUntil === -1 || daysUntil === -3 || daysUntil === -7
      if (!shouldSend) { results.skipped++; continue }

      // Apply late fee if past grace period
      if (daysUntil < -property.late_fee_grace_period && payment.late_fee_applied === 0) {
        await supabaseAdmin
          .from('rent_payments')
          .update({ status: 'late', late_fee_applied: property.late_fee_amount })
          .eq('id', payment.id)
      }

      const messageText = daysUntil >= 0
        ? daysUntil === 0
          ? REMINDER_TEMPLATES.dueToday(tenant.name, payment.amount)
          : daysUntil === 1
          ? REMINDER_TEMPLATES.oneDayBefore(tenant.name, payment.amount)
          : REMINDER_TEMPLATES.threeDaysBefore(tenant.name, payment.amount, payment.due_date)
        : REMINDER_TEMPLATES.overdue(tenant.name, payment.amount, Math.abs(daysUntil), property.late_fee_amount)

      // Send SMS if tenant has phone
      if (tenant.phone && (landlord.subscription_tier === 'starter' || landlord.subscription_tier === 'pro')) {
        const smsResult = await withRetry(() => sendSMS(tenant.phone, messageText))
        if (smsResult.success) {
          results.sent++
          await supabaseAdmin.from('communications').insert({
            landlord_id: payment.landlord_id,
            tenant_id: payment.tenant_id,
            type: 'sms',
            direction: 'outbound',
            content: messageText,
            status: 'sent',
            metadata: { payment_id: payment.id, days_until_due: daysUntil },
          })
        } else {
          results.failed++
        }
      }

      // Send email if tenant has email
      if (tenant.email) {
        const { subject, html } = rentReminderEmailHTML({
          tenantName: tenant.name,
          amount: payment.amount,
          dueDate: payment.due_date,
          landlordName: landlord.name ?? 'Your Landlord',
          daysUntilDue: daysUntil,
          lateFeeAmount: payment.late_fee_applied,
        })
        const emailResult = await withRetry(() => sendEmail({ to: tenant.email, subject, html }))
        if (emailResult.success) {
          results.sent++
          await supabaseAdmin.from('communications').insert({
            landlord_id: payment.landlord_id,
            tenant_id: payment.tenant_id,
            type: 'email',
            direction: 'outbound',
            content: messageText,
            status: 'sent',
            metadata: { payment_id: payment.id, days_until_due: daysUntil, email_id: emailResult.id },
          })
        } else {
          results.failed++
        }
      }
    }

    console.log(`Rent reminders: ${results.sent} sent, ${results.failed} failed, ${results.skipped} skipped`)
    return NextResponse.json({ success: true, date: today, ...results })
  } catch (error: any) {
    console.error('Rent reminder cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
