import Link from 'next/link'
import { 
  Bell, DollarSign, FileText, Shield, MessageSquare, 
  BarChart3, CheckCircle2, ArrowRight, Home, Star, 
  Zap, Clock, TrendingUp
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-semibold text-xl text-stone-800">TinyLandlord</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-stone-600 hover:text-stone-900 text-sm transition-colors">Features</a>
            <a href="#pricing" className="text-stone-600 hover:text-stone-900 text-sm transition-colors">Pricing</a>
            <a href="#faq" className="text-stone-600 hover:text-stone-900 text-sm transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900 font-medium transition-colors">
              Log in
            </Link>
            <Link 
              href="/register" 
              className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Star className="w-3.5 h-3.5 fill-current" />
            Trusted by 500+ independent landlords
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-stone-900 leading-tight mb-6">
            Stop chasing rent.<br />
            <em className="text-emerald-700 not-italic">Start collecting it.</em>
          </h1>
          <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Property management for landlords with 2–10 units. Automatic reminders, late fees, 
            and tax-ready reports — without the Buildium price tag.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register"
              className="bg-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-800 transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
            >
              Start free — no credit card
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-stone-500 text-sm">From $9/month. Cancel anytime.</p>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-800 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-stone-400 text-xs ml-2">TinyLandlord Dashboard</span>
            </div>
            <div className="p-6 bg-stone-50">
              {/* Fake dashboard stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Collected This Month', value: '$6,250', trend: '+2', color: 'emerald' },
                  { label: 'Outstanding', value: '$1,200', trend: '2 units', color: 'amber' },
                  { label: 'Occupancy Rate', value: '89%', trend: '8/9 units', color: 'blue' },
                  { label: 'Net Income YTD', value: '$52,100', trend: '+12%', color: 'violet' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
                    <p className="text-xs text-stone-500 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-stone-800">{stat.value}</p>
                    <p className="text-xs text-emerald-600 mt-1">{stat.trend}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
                  <p className="text-sm font-semibold text-stone-700 mb-3">Upcoming Rent (Next 7 Days)</p>
                  {[
                    { name: 'Maria Santos', unit: 'Unit 2A', amount: '$1,450', days: 'Due tomorrow', status: 'pending' },
                    { name: 'James Wilson', unit: 'Unit 4B', amount: '$1,200', days: 'Due in 3 days', status: 'pending' },
                    { name: 'Sarah Chen', unit: 'Unit 1C', amount: '$1,600', days: '⚠️ 5 days late', status: 'late' },
                  ].map((t) => (
                    <div key={t.name} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-stone-800">{t.name}</p>
                        <p className="text-xs text-stone-500">{t.unit} · {t.days}</p>
                      </div>
                      <span className={`text-sm font-semibold ${t.status === 'late' ? 'text-red-600' : 'text-stone-800'}`}>{t.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
                  <p className="text-sm font-semibold text-stone-700 mb-3">Quick Actions</p>
                  {[
                    { label: 'Record Payment', icon: '💵' },
                    { label: 'Send Reminder', icon: '📱' },
                    { label: 'Add Expense', icon: '📋' },
                    { label: 'View Reports', icon: '📊' },
                  ].map((a) => (
                    <div key={a.label} className="flex items-center gap-2 py-1.5 text-sm text-stone-700 hover:text-emerald-700 cursor-pointer transition-colors">
                      <span>{a.icon}</span>{a.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-red-500 font-semibold text-sm mb-3 uppercase tracking-wide">The Problem</div>
              <h2 className="font-serif text-3xl font-bold text-stone-900 mb-4">
                You're running a business on sticky notes and guilt
              </h2>
              <div className="space-y-3">
                {[
                  'Spreadsheets that break every month',
                  'Forgetting to follow up on late rent',
                  'Losing receipts for tax deductions',
                  'Buildium costs $55+/month for 2 units',
                  'Hours wasted on manual payment records',
                ].map((p) => (
                  <div key={p} className="flex items-center gap-3 text-stone-600">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-500 text-xs">✕</span>
                    </div>
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-emerald-600 font-semibold text-sm mb-3 uppercase tracking-wide">The Solution</div>
              <h2 className="font-serif text-3xl font-bold text-stone-900 mb-4">
                Everything you need. Nothing you don't.
              </h2>
              <div className="space-y-3">
                {[
                  'Automatic SMS & email reminders',
                  'Late fees applied with one click',
                  'Tax-ready Schedule E reports',
                  'Starts at $9/month (not $55)',
                  'Payment history in seconds, not hours',
                ].map((s) => (
                  <div key={s} className="flex items-center gap-3 text-stone-600">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 text-xs">✓</span>
                    </div>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-stone-900 mb-4">Built for the small landlord</h2>
            <p className="text-stone-600 max-w-xl mx-auto">Every feature exists to save you time or money. No enterprise bloat.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bell,
                title: 'Automatic Reminders',
                desc: 'SMS, email, and WhatsApp reminders sent 3 days before, day of, and when overdue. AI-personalized for each tenant.',
                color: 'emerald',
              },
              {
                icon: DollarSign,
                title: 'Late Fee Automation',
                desc: 'Set your grace period and fee amount once. Late fees are auto-calculated and applied. No more awkward conversations.',
                color: 'amber',
              },
              {
                icon: FileText,
                title: 'Tax-Ready Reports',
                desc: 'Schedule E summary, income by property, deductible expenses — everything your accountant needs, exported to PDF or CSV.',
                color: 'blue',
              },
              {
                icon: MessageSquare,
                title: 'Communications Log',
                desc: 'Full history of every message sent. Use AI to compose professional notices for late rent, lease renewal, or maintenance.',
                color: 'violet',
              },
              {
                icon: BarChart3,
                title: 'Expense Tracking',
                desc: 'Log and categorize repairs, insurance, utilities, and more. Attach receipts. Instantly see your net income.',
                color: 'rose',
              },
              {
                icon: Shield,
                title: 'Maintenance Tracking',
                desc: 'Track work orders from request to completion. Log costs, assign vendors, and keep a paper trail for disputes.',
                color: 'teal',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${color}-700`} />
                </div>
                <h3 className="font-semibold text-stone-900 text-lg mb-2">{title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-6 bg-emerald-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-300 text-sm font-semibold uppercase tracking-wide mb-2">What landlords say</p>
            <h2 className="font-serif text-3xl font-bold text-white">Simple tools. Real results.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Robert K.', units: '4 units, Chicago', quote: "Recovered $800 in late fees I used to just write off. Paid for itself in the first month." },
              { name: 'Diane M.', units: '7 units, Austin', quote: "My accountant actually thanked me this year. The Schedule E export saved us both hours." },
              { name: 'Tom S.', units: '3 units, Phoenix', quote: "I switched from Buildium and saved $40/month. The SMS reminders alone are worth it." },
            ].map((t) => (
              <div key={t.name} className="bg-emerald-800/50 rounded-xl p-6 border border-emerald-700">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-emerald-100 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-emerald-400 text-xs">{t.units}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-stone-900 mb-4">Honest pricing</h2>
            <p className="text-stone-600">No per-unit fees. No setup costs. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                features: ['1 property', 'Basic payment tracking', 'Email reminders', 'Maintenance log'],
                cta: 'Get started',
                highlight: false,
              },
              {
                name: 'Starter',
                price: '$9',
                period: 'per month',
                features: ['5 properties', 'Automatic late fees', 'SMS reminders', 'Expense tracking', 'CSV export'],
                cta: 'Start 14-day trial',
                highlight: true,
                badge: 'Most popular',
              },
              {
                name: 'Pro',
                price: '$19',
                period: 'per month',
                features: ['Unlimited properties', 'AI message composer', 'WhatsApp reminders', 'Schedule E PDF', 'Priority support'],
                cta: 'Start 14-day trial',
                highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 border ${plan.highlight ? 'bg-emerald-700 border-emerald-600 text-white shadow-2xl scale-105' : 'bg-white border-stone-200'}`}>
                {plan.badge && (
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <p className={`font-semibold text-sm mb-1 ${plan.highlight ? 'text-emerald-200' : 'text-stone-500'}`}>{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-emerald-200' : 'text-stone-500'}`}>/{plan.period}</span>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      {f}
                    </div>
                  ))}
                </div>
                <Link 
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.highlight 
                      ? 'bg-white text-emerald-700 hover:bg-emerald-50' 
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-stone-900 text-center mb-12">Common questions</h2>
          <div className="space-y-6">
            {[
              { q: 'Does TinyLandlord handle online rent collection?', a: 'TinyLandlord tracks payments made via any method (cash, check, Venmo, Zelle, etc.). Online payment collection via Stripe is available for Pro users.' },
              { q: 'How much do the SMS reminders cost?', a: 'SMS costs are included in your subscription — we absorb the Twilio costs. WhatsApp reminders are available on Pro.' },
              { q: 'Is my data secure?', a: 'Yes. All data is encrypted at rest and in transit using Supabase (built on PostgreSQL). Row-level security ensures your data is never visible to other users.' },
              { q: 'Can I export my data?', a: 'All your data is exportable to CSV at any time. Pro users can also generate PDF Schedule E reports for tax purposes.' },
              { q: 'What happens if I cancel?', a: 'You can export your data any time and cancel with no penalty. Your data is retained for 30 days after cancellation.' },
              { q: 'Do you charge per unit or per property?', a: 'Per property (address), not per unit. A 4-plex at one address counts as 1 property on Starter.' },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-stone-100 pb-6">
                <p className="font-semibold text-stone-900 mb-2">{q}</p>
                <p className="text-stone-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center bg-emerald-700 rounded-3xl p-12">
          <h2 className="font-serif text-4xl font-bold text-white mb-4">Ready to stop chasing rent?</h2>
          <p className="text-emerald-200 mb-8">Free forever for 1 property. No credit card required to start.</p>
          <Link 
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-all"
          >
            Create your free account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-stone-200 bg-stone-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-700 rounded flex items-center justify-center">
              <Home className="w-3 h-3 text-white" />
            </div>
            <span className="font-serif font-semibold text-stone-800">TinyLandlord</span>
          </div>
          <p className="text-stone-500 text-sm">© 2024 TinyLandlord. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-stone-500">
            <a href="/privacy" className="hover:text-stone-800">Privacy</a>
            <a href="/terms" className="hover:text-stone-800">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
