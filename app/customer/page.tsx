'use client'
import { useEffect, useState, useCallback } from 'react'

const STATION_ID = '1'

// ── helpers ──────────────────────────────────────────────────────
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vs_customer_token') : null }
function getUser()  { try { return JSON.parse(localStorage.getItem('vs_customer_user') || 'null') } catch { return null } }

async function api(path: string, opts: RequestInit = {}) {
  const token = getToken()
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(opts.headers || {}),
    },
  })
  return res.json()
}

// ── sub-components ────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-10 text-white/30 gap-2 text-sm">
      <div className="w-4 h-4 border-2 border-white/10 border-t-[#00d4aa] rounded-full animate-spin" />
      Loading...
    </div>
  )
}

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div className={`fixed bottom-5 right-5 z-50 bg-[#0f1520] border border-white/10 border-l-2 border-l-[#00d4aa] rounded-xl px-4 py-3 text-sm max-w-xs transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      {msg}
    </div>
  )
}

function useToast() {
  const [msg, setMsg] = useState('')
  const [show, setShow] = useState(false)
  const toast = useCallback((m: string) => {
    setMsg(m); setShow(true)
    setTimeout(() => setShow(false), 3000)
  }, [])
  return { msg, show, toast }
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: 'bg-emerald-500/15 text-emerald-400',
    busy: 'bg-red-500/15 text-red-400',
    waiting: 'bg-amber-500/15 text-amber-400',
    maintenance: 'bg-orange-500/15 text-orange-400',
    confirmed: 'bg-emerald-500/15 text-emerald-400',
    pending: 'bg-amber-500/15 text-amber-400',
    cancelled: 'bg-red-500/15 text-red-400',
    completed: 'bg-sky-500/15 text-sky-400',
    basic: 'bg-sky-500/15 text-sky-400',
    premium: 'bg-violet-500/15 text-violet-300',
    deluxe: 'bg-amber-500/15 text-amber-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${map[status] || 'bg-white/5 text-white/40'}`}>
      ● {status}
    </span>
  )
}

// ── Auth Screen ───────────────────────────────────────────────────
function AuthScreen({ onAuth }: { onAuth: (user: any, token: string) => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', phone: '', car_model: '', car_plate: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.phone) { setErr('Phone number required'); return }
    if (tab === 'register' && !form.name) { setErr('Name required'); return }
    setLoading(true); setErr('')
    try {
      const d = await api('/api/customer/auth', {
        method: 'POST',
        body: JSON.stringify({ action: tab, ...form }),
      })
      if (!d.success) { setErr(d.error); setLoading(false); return }
      localStorage.setItem('vs_customer_token', d.token)
      localStorage.setItem('vs_customer_user', JSON.stringify(d.user))
      onAuth(d.user, d.token)
    } catch {
      setErr('Cannot connect to server')
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2.5 bg-[#141b26] border border-white/8 rounded-xl text-white text-sm outline-none focus:border-[#00d4aa]/50 transition-colors placeholder:text-white/20"

  return (
    <div className="min-h-screen bg-[#07090f] flex items-center justify-center px-4" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(0,212,170,0.04), transparent 60%)' }}>
      <div className="w-full max-w-sm bg-[#0f1520] border border-white/8 rounded-2xl p-7 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00d4aa] to-[#0099ff]" />

        <div className="font-black text-2xl mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#00d4aa' }}>
          Volt<span className="text-white">Station</span>
        </div>
        <div className="text-white/30 text-xs mb-6">EV Charging Made Easy</div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/4 rounded-xl p-1 mb-5">
          {(['login', 'register'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setErr('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-[#0f1520] text-white' : 'text-white/40 hover:text-white/60'}`}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {err && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-400 text-[0.8rem] mb-4">{err}</div>}

        {tab === 'register' && (
          <>
            <div className="mb-3"><label className="text-[0.73rem] text-white/35 mb-1.5 block">Full Name</label>
              <input className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ahmed Khan" />
            </div>
            <div className="mb-3"><label className="text-[0.73rem] text-white/35 mb-1.5 block">Car Model</label>
              <input className={inp} value={form.car_model} onChange={e => setForm({ ...form, car_model: e.target.value })} placeholder="Tesla Model 3" />
            </div>
            <div className="mb-3"><label className="text-[0.73rem] text-white/35 mb-1.5 block">Car Plate</label>
              <input className={inp} value={form.car_plate} onChange={e => setForm({ ...form, car_plate: e.target.value })} placeholder="KHI-442" />
            </div>
          </>
        )}

        <div className="mb-4"><label className="text-[0.73rem] text-white/35 mb-1.5 block">Phone Number</label>
          <input className={inp} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="03XX-XXXXXXX" type="tel" onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        <button onClick={submit} disabled={loading}
          className="w-full py-3 bg-[#00d4aa] text-black font-bold rounded-xl text-sm hover:bg-[#00e8bb] transition-colors disabled:opacity-60">
          {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div className="mt-4 p-3 bg-[#00d4aa]/5 rounded-xl text-[0.73rem] text-white/30">
          💡 Demo: Login with phone <strong className="text-white">03124445566</strong>
        </div>
      </div>
    </div>
  )
}

// ── Live Status Section ───────────────────────────────────────────
function LiveStatus({ toast }: { toast: (m: string) => void }) {
  const [chargers, setChargers] = useState<any[]>([])
  const [summary, setSummary] = useState({ available: 0, busy: 0, waiting: 0, total: 0 })
  const [queue, setQueue] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'available' | 'busy'>('all')
  const [station, setStation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [ch, q, ana] = await Promise.all([
      api(`/api/customer/chargers?station_id=${STATION_ID}`),
      api(`/api/customer/queue?station_id=${STATION_ID}`),
      api(`/api/customer/analytics?station_id=${STATION_ID}`),
    ])
    if (ch.success) { setChargers(ch.chargers || []); setSummary(ch.summary) }
    if (q.success)  setQueue(q.queue || [])
    if (ana.success) setAnalytics(ana)
    setLoading(false)
  }, [])

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv) }, [load])

  const filtered = filter === 'all' ? chargers : chargers.filter(c => c.status === filter)

  const statusColor: Record<string, string> = {
    available: 'border-emerald-500/30 hover:border-emerald-500/60',
    busy: 'border-red-500/30',
    waiting: 'border-amber-500/30',
    maintenance: 'border-orange-500/20 opacity-50',
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#07090f] via-[#0d1f35] to-[#07090f] px-5 pt-5 pb-4 border-b border-white/5">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h1 className="text-2xl font-black leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Live Charging<br /><span className="text-[#00d4aa]">Station Status</span>
            </h1>
            <p className="text-white/35 text-xs mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Auto-updates every 5s
            </p>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>VoltStation Karachi Hub-1</div>
            <div className="text-white/30 text-xs mt-0.5">Plot 42, Shahrah-e-Faisal</div>
            <div className="text-white/25 text-xs mt-0.5">Open 24/7 · 12 Chargers</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { label: 'AVAILABLE', value: summary.available, color: '#00d4aa', sub: 'Ready now' },
            { label: 'CHARGING', value: summary.busy, color: '#ef4444', sub: 'Active' },
            { label: 'QUEUE', value: queue.length, color: '#f59e0b', sub: 'Waiting' },
            { label: 'TODAY', value: analytics?.today_sessions ?? '—', color: '#a78bfa', sub: 'Sessions' },
          ].map(s => (
            <div key={s.label} className="relative bg-[#0f1520] border border-white/5 rounded-xl p-3 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: s.color }} />
              <div className="text-[0.6rem] text-white/25 tracking-wider uppercase mb-1.5">{s.label}</div>
              <div className="text-3xl font-black" style={{ color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
              <div className="text-[0.65rem] text-white/25 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Filter */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>All Chargers</h2>
          <div className="flex gap-1.5">
            {(['all', 'available', 'busy'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/30' : 'border border-white/8 text-white/40 hover:text-white/60'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Charger Grid */}
        {loading ? <Spinner /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-5">
            {filtered.map(c => (
              <div key={c.id}
                className={`bg-[#0f1520] border rounded-xl p-3 cursor-pointer transition-all ${statusColor[c.status] || 'border-white/5'}`}
                onClick={() => c.status === 'available' && toast(`Book ${c.charger_code} — go to Book Slot tab`)}>
                <div className="font-bold text-[#00d4aa] text-sm mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{c.charger_code}</div>
                <div className="text-white/30 text-[0.62rem] mb-2">{c.type?.replace('_', ' ')}</div>
                <div className="text-lg font-black text-[#00d4aa]" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {c.power_kw}<span className="text-[0.6rem] text-white/30 font-normal"> kW</span>
                </div>
                <Badge status={c.status} />
                {c.status === 'busy' && c.elapsed_min != null && (
                  <div className="mt-2">
                    <div className="text-[0.6rem] text-white/30 mb-1">{Math.min(99, Math.round((c.elapsed_min / 45) * 100))}% complete</div>
                    <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${Math.min(99, Math.round((c.elapsed_min / 45) * 100))}%` }} />
                    </div>
                  </div>
                )}
                {c.status === 'available' && (
                  <div className="mt-2">
                    <span className="text-[0.6rem] text-emerald-400 font-semibold">Tap to book →</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Queue + Speed Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Queue */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>Waiting Queue</h2>
              <span className="text-amber-400 text-xs font-bold">{queue.length} cars</span>
            </div>
            {queue.length === 0 ? (
              <div className="text-center py-8 text-white/25 text-sm">
                <div className="text-2xl mb-2">🎉</div>
                No cars waiting!
              </div>
            ) : (
              <div className="space-y-2">
                {queue.slice(0, 4).map((q: any) => (
                  <div key={q.id} className="flex items-center gap-3 bg-[#0f1520] border border-white/5 rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center font-black text-sm flex-shrink-0">{q.position}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{q.car_model || 'EV Car'} <span className="text-white/25 text-[0.68rem]">· {q.car_plate}</span></div>
                      <div className="text-[0.68rem] text-white/25">{q.charger_pref || 'Any charger'}</div>
                    </div>
                    <div className="text-amber-400 font-bold text-sm flex-shrink-0">~{20 + q.position * 15}min</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Speed Chart */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>Speed Trend (kW)</h2>
              {analytics && (
                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">+{analytics.avg_improvement}% faster</span>
              )}
            </div>
            <div className="bg-[#0f1520] border border-white/5 rounded-xl p-3">
              {analytics?.weekly_chart?.length ? (
                <div className="flex items-end gap-1.5 h-24">
                  {analytics.weekly_chart.map((d: any) => {
                    const max = Math.max(...analytics.weekly_chart.map((x: any) => x.avg_speed || 1))
                    const pct = ((d.avg_speed || 0) / max) * 100
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[0.55rem] text-white/35 font-semibold">{d.avg_speed}</span>
                        <div className="w-full rounded-t" style={{ height: `${pct}%`, background: '#00d4aa', opacity: 0.8, minHeight: '4px' }} />
                        <span className="text-[0.55rem] text-white/25">{d.day}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center">
                  <span className="text-white/20 text-xs">No data yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Book Slot Section ─────────────────────────────────────────────
function BookSlot({ user, toast }: { user: any; toast: (m: string) => void }) {
  const [chargers, setChargers] = useState<any[]>([])
  const [form, setForm] = useState({ charger_id: '', charger_type: 'DC_FAST', date: '', time: '', wash_pkg: '' })
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<any>(null)

  const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
                 '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']

  useEffect(() => {
    api(`/api/customer/chargers?station_id=${STATION_ID}`).then(d => {
      if (d.success) setChargers(d.chargers || [])
    })
    const today = new Date().toISOString().split('T')[0]
    setForm(f => ({ ...f, date: today }))
  }, [])

  const availableChargers = chargers.filter(c => c.type === form.charger_type && c.status === 'available')

  const submit = async () => {
    if (!selectedSlot) { toast('⚠️ Please select a time slot'); return }
    if (!availableChargers.length) { toast('⚠️ No available charger of this type right now'); return }
    setLoading(true)
    const booked_at = `${form.date}T${selectedSlot}:00`
    const d = await api('/api/customer/bookings', {
      method: 'POST',
      body: JSON.stringify({
        charger_id: availableChargers[0].id,
        charger_type: form.charger_type,
        booked_at,
        wash_pkg: form.wash_pkg || null,
      }),
    })
    setLoading(false)
    if (!d.success) { toast('❌ ' + d.error); return }
    setSuccess(d.booking)
    setSelectedSlot('')
    toast('✅ Booking confirmed!')
  }

  const inp = "w-full px-3 py-2.5 bg-[#141b26] border border-white/8 rounded-xl text-white text-sm outline-none focus:border-[#00d4aa]/50 transition-colors"

  if (success) return (
    <div className="px-5 py-6 flex flex-col items-center text-center">
      <div className="text-4xl mb-3">✅</div>
      <div className="text-lg font-black mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Booking Confirmed!</div>
      <div className="text-white/40 text-sm mb-4">Your slot has been reserved successfully.</div>
      <div className="w-full max-w-sm bg-[#0f1520] border border-white/8 rounded-2xl p-4 text-left text-sm">
        <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/40">Booking ID</span><span className="text-[#00d4aa] font-bold">{success.booking_ref}</span></div>
        <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/40">Type</span><span>{success.charger_type?.replace('_', ' ')}</span></div>
        <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/40">Date/Time</span><span>{new Date(success.booked_at).toLocaleString()}</span></div>
        <div className="flex justify-between py-2"><span className="text-white/40">Est. Amount</span><span className="font-bold">Rs.{success.estimated_amt}</span></div>
      </div>
      <button onClick={() => setSuccess(null)} className="mt-4 px-6 py-2.5 bg-[#00d4aa] text-black font-bold rounded-xl text-sm">Book Another</button>
    </div>
  )

  return (
    <div className="px-5 py-4">
      <h2 className="text-lg font-black mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Book a Charging Slot</h2>
      <p className="text-white/30 text-xs mb-4">Reserve your charger in advance.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0f1520] border border-white/8 rounded-2xl p-4">
          <div className="mb-3"><label className="text-[0.73rem] text-white/35 mb-1.5 block">Charger Type</label>
            <select className={inp} value={form.charger_type} onChange={e => setForm({ ...form, charger_type: e.target.value })}>
              <option value="DC_ULTRA">⚡ DC Ultra Fast (150kW) — ~15 min — Rs.65/kWh</option>
              <option value="DC_FAST">⚡ DC Fast (50kW) — ~40 min — Rs.45/kWh</option>
              <option value="AC_LEVEL2">🔌 AC Level 2 (22kW) — ~90 min — Rs.30/kWh</option>
            </select>
          </div>
          <div className="mb-3"><label className="text-[0.73rem] text-white/35 mb-1.5 block">Date</label>
            <input className={inp} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="mb-3"><label className="text-[0.73rem] text-white/35 mb-1.5 block">Selected Slot</label>
            <input className={inp} readOnly value={selectedSlot ? `${form.date} at ${selectedSlot}` : ''} placeholder="Pick a slot from the grid →" />
          </div>
          <div className="mb-4"><label className="text-[0.73rem] text-white/35 mb-1.5 block">Add Car Wash?</label>
            <select className={inp} value={form.wash_pkg} onChange={e => setForm({ ...form, wash_pkg: e.target.value })}>
              <option value="">No thanks</option>
              <option value="basic">🚿 Basic — Rs.500</option>
              <option value="premium">✨ Premium — Rs.1,200</option>
              <option value="deluxe">💎 Deluxe Detailing — Rs.2,500</option>
            </select>
          </div>

          {availableChargers.length === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-amber-400 text-xs mb-3">
              ⚠️ No {form.charger_type.replace('_', ' ')} charger available right now. Try another type.
            </div>
          )}

          <button onClick={submit} disabled={loading || !selectedSlot || availableChargers.length === 0}
            className="w-full py-3 bg-[#00d4aa] text-black font-bold rounded-xl text-sm hover:bg-[#00e8bb] transition-colors disabled:opacity-50">
            {loading ? 'Booking...' : '⚡ Confirm Booking'}
          </button>
        </div>

        <div>
          <div className="bg-[#0f1520] border border-white/8 rounded-2xl p-4 mb-3">
            <div className="font-bold text-sm mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Available Time Slots</div>
            <div className="grid grid-cols-4 gap-1.5">
              {slots.map(t => (
                <button key={t} onClick={() => setSelectedSlot(t)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all border ${
                    selectedSlot === t
                      ? 'bg-[#00d4aa]/20 text-[#00d4aa] border-[#00d4aa]/50'
                      : 'bg-emerald-500/8 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-[#0f1520] border border-white/8 rounded-2xl p-4">
            <div className="font-bold text-sm mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Pricing</div>
            {[
              { type: 'DC Ultra Fast (150kW)', price: 'Rs.65/kWh' },
              { type: 'DC Fast (50kW)', price: 'Rs.45/kWh' },
              { type: 'AC Level 2 (22kW)', price: 'Rs.30/kWh' },
            ].map(p => (
              <div key={p.type} className="flex justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                <span className="text-white/50">{p.type}</span>
                <span className="text-[#00d4aa] font-bold">{p.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Analytics Section ─────────────────────────────────────────────
function Analytics({ toast }: { toast: (m: string) => void }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    api(`/api/customer/analytics?station_id=${STATION_ID}`).then(d => { if (d.success) setData(d) })
  }, [])

  if (!data) return <Spinner />

  return (
    <div className="px-5 py-4">
      <h2 className="text-lg font-black mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Station Analytics</h2>
      <p className="text-white/30 text-xs mb-4">Performance & improvement trends</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        {[
          { label: 'Avg. Charge Time', value: '28 min', sub: '↓ was 42 min', color: '#00d4aa' },
          { label: 'Today Sessions', value: data.today_sessions, sub: 'growing', color: '#0099ff' },
          { label: 'Avg Improvement', value: `+${data.avg_improvement}%`, sub: 'vs last month', color: '#10b981' },
          { label: 'Station Uptime', value: '99.2%', sub: '↑ was 94.5%', color: '#a78bfa' },
        ].map(k => (
          <div key={k.label} className="relative bg-[#0f1520] border border-white/5 rounded-xl p-3 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
            <div className="text-[0.6rem] text-white/25 uppercase tracking-wider mb-1.5">{k.label}</div>
            <div className="text-2xl font-black" style={{ color: k.color, fontFamily: 'Syne, sans-serif' }}>{k.value}</div>
            <div className="text-[0.65rem] text-emerald-400 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {data.weekly_chart?.length > 0 && (
        <div className="bg-[#0f1520] border border-white/5 rounded-2xl p-4 mb-4">
          <div className="font-bold text-sm mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Weekly Avg Speed (kW)</div>
          <div className="flex items-end gap-2 h-28">
            {data.weekly_chart.map((d: any) => {
              const max = Math.max(...data.weekly_chart.map((x: any) => x.avg_speed || 1))
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[0.6rem] text-white/35 font-semibold">{d.avg_speed}</span>
                  <div className="w-full rounded-t" style={{ height: `${((d.avg_speed || 0) / max) * 100}%`, background: '#00d4aa', opacity: 0.8, minHeight: '4px' }} />
                  <span className="text-[0.6rem] text-white/25">{d.day}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {data.recent_sessions?.length > 0 && (
        <div className="bg-[#0f1520] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>Recent Sessions</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-white/2">
                {['Car', 'Charger', 'Duration', 'Energy', 'Speed', 'Improvement', 'Cost'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[0.6rem] text-white/25 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {data.recent_sessions.map((s: any) => (
                  <tr key={s.id} className="border-t border-white/4 hover:bg-white/1">
                    <td className="px-4 py-2.5"><div className="text-xs font-medium">{s.customer_name}</div><div className="text-[0.65rem] text-white/25">{s.car_plate}</div></td>
                    <td className="px-4 py-2.5 text-xs text-white/50">{s.charger_code}·{s.power_kw}kW</td>
                    <td className="px-4 py-2.5"><span className="bg-[#00d4aa]/10 text-[#00d4aa] px-2 py-0.5 rounded-full text-[0.65rem] font-semibold">{s.duration_min || '—'} min</span></td>
                    <td className="px-4 py-2.5 text-xs">{s.energy_kwh || '—'} kWh</td>
                    <td className="px-4 py-2.5 text-[#00d4aa] text-xs font-bold">{s.avg_speed_kw || '—'} kW</td>
                    <td className="px-4 py-2.5 text-emerald-400 text-xs font-bold">{s.improvement_pct ? '+' + s.improvement_pct + '%' : '—'}</td>
                    <td className="px-4 py-2.5 text-xs font-bold">Rs.{s.cost || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shops Section ─────────────────────────────────────────────────
function Shops({ toast }: { toast: (m: string) => void }) {
  const [shops, setShops] = useState<any[]>([])
  const [selPkg, setSelPkg] = useState('')
  const [loading, setLoading] = useState(true)
  const [washLoading, setWashLoading] = useState(false)

  useEffect(() => {
    api(`/api/customer/shops?station_id=${STATION_ID}`).then(d => {
      if (d.success) setShops(d.shops)
      setLoading(false)
    })
  }, [])

  const bookWash = async () => {
    if (!selPkg) { toast('⚠️ Please select a car wash package'); return }
    setWashLoading(true)
    const d = await api('/api/customer/carwash', { method: 'POST', body: JSON.stringify({ package: selPkg }) })
    setWashLoading(false)
    if (!d.success) { toast('❌ ' + d.error); return }
    toast('✅ ' + d.message)
    setSelPkg('')
  }

  return (
    <div className="px-5 py-4">
      <h2 className="text-lg font-black mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Shops & Services</h2>
      <p className="text-white/30 text-xs mb-4">Available while your car charges</p>

      {/* Car Wash */}
      <div className="bg-[#0f1520] border border-white/8 rounded-2xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="text-center text-6xl">🚿</div>
        <div>
          <div className="font-black text-base mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>⚡ Car Wash Zone</div>
          <ul className="text-xs text-white/40 space-y-1 mb-3">
            {['Automatic foam wash', 'Interior vacuum & wipe', 'Tyre shine & polish'].map(f => (
              <li key={f} className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span>{f}</li>
            ))}
          </ul>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[{ pkg: 'basic', name: 'Basic', price: 'Rs.500', feat: 'Exterior' },
              { pkg: 'premium', name: 'Premium', price: 'Rs.1,200', feat: '+Vacuum' },
              { pkg: 'deluxe', name: 'Deluxe', price: 'Rs.2,500', feat: 'Full detail' }].map(p => (
              <button key={p.pkg} onClick={() => setSelPkg(p.pkg)}
                className={`py-2 px-1 rounded-xl border text-center transition-all ${selPkg === p.pkg ? 'border-[#00d4aa] bg-[#00d4aa]/10' : 'border-white/8 bg-[#141b26] hover:border-white/20'}`}>
                <div className="text-xs font-bold">{p.name}</div>
                <div className="text-[#00d4aa] font-black text-sm">{p.price}</div>
                <div className="text-[0.6rem] text-white/30">{p.feat}</div>
              </button>
            ))}
          </div>
          <button onClick={bookWash} disabled={washLoading || !selPkg}
            className="w-full py-2.5 bg-[#00d4aa] text-black font-bold rounded-xl text-sm hover:bg-[#00e8bb] transition-colors disabled:opacity-50">
            {washLoading ? 'Booking...' : 'Book Car Wash'}
          </button>
        </div>
      </div>

      {/* Shops Grid */}
      <h3 className="font-bold text-sm mb-2.5" style={{ fontFamily: 'Syne, sans-serif' }}>All Shops at Station</h3>
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {shops.map(s => (
            <div key={s.id} className="bg-[#0f1520] border border-white/5 rounded-xl p-3 cursor-pointer hover:border-white/15 transition-all">
              <div className="text-2xl mb-1.5">{s.icon || '🏪'}</div>
              <div className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{s.name}</div>
              <div className="text-white/30 text-[0.65rem] my-1">{s.type}</div>
              <div className="flex items-center justify-between">
                <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${s.is_open ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                  {s.is_open ? 'Open' : 'Closed'}
                </span>
                <span className="text-[0.6rem] text-white/20">{s.hours}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── My Bookings Section ───────────────────────────────────────────
function MyBookings({ user, toast }: { user: any; toast: (m: string) => void }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const d = await api('/api/customer/bookings')
    if (d.success) setBookings(d.bookings || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const cancel = async (id: number) => {
    if (!confirm('Cancel this booking?')) return
    const d = await api(`/api/customer/bookings?id=${id}`, { method: 'DELETE' })
    if (d.success) { toast('✅ Booking cancelled'); load() }
    else toast('❌ ' + d.error)
  }

  if (loading) return <div className="px-5 py-4"><Spinner /></div>

  return (
    <div className="px-5 py-4">
      <h2 className="text-lg font-black mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>My Bookings</h2>
      <p className="text-white/30 text-xs mb-4">Your upcoming and past reservations</p>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-white/25">
          <div className="text-4xl mb-3">📅</div>
          <div className="font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>No bookings yet</div>
          <p className="text-sm">Go to Book Slot to reserve your charger</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {bookings.map((b: any) => (
            <div key={b.id} className="bg-[#0f1520] border border-white/8 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#00d4aa] font-black text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{b.booking_ref}</span>
                <Badge status={b.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div><div className="text-[0.65rem] text-white/25 mb-0.5">Charger</div><div className="font-medium">{b.charger_code || '—'} · {b.power_kw}kW</div></div>
                <div><div className="text-[0.65rem] text-white/25 mb-0.5">Type</div><div className="font-medium">{(b.charger_type || b.type || '').replace('_', ' ')}</div></div>
                <div><div className="text-[0.65rem] text-white/25 mb-0.5">Date & Time</div><div className="font-medium">{new Date(b.booked_at).toLocaleString()}</div></div>
                <div><div className="text-[0.65rem] text-white/25 mb-0.5">Car Wash</div><div className="font-medium">{b.wash_pkg || '—'}</div></div>
                <div><div className="text-[0.65rem] text-white/25 mb-0.5">Est. Amount</div><div className="text-[#00d4aa] font-bold">Rs.{b.estimated_amt}</div></div>
                {b.status !== 'completed' && b.status !== 'cancelled' && (
                  <div className="flex items-end">
                    <button onClick={() => cancel(b.id)} className="px-3 py-1.5 rounded-lg border border-red-500/25 text-red-400 text-xs hover:bg-red-500/10 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'live',    label: 'Live',      icon: '●' },
  { id: 'book',    label: 'Book Slot', icon: '📅' },
  { id: 'mybookings', label: 'My Bookings', icon: '🎫' },
  { id: 'analytics',  label: 'Analytics',  icon: '📊' },
  { id: 'shops',   label: 'Shops',     icon: '🏪' },
]

export default function CustomerApp() {
  const [user, setUser] = useState<any>(null)
  const [active, setActive] = useState('live')
  const { msg, show, toast } = useToast()

  useEffect(() => {
    const u = getUser()
    const t = getToken()
    if (u && t) setUser(u)
  }, [])

  const logout = () => {
    if (!confirm('Sign out?')) return
    localStorage.removeItem('vs_customer_token')
    localStorage.removeItem('vs_customer_user')
    setUser(null)
  }

  if (!user) return <AuthScreen onAuth={(u) => setUser(u)} />

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      <div className="min-h-screen bg-[#07090f] text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>

        {/* Nav */}
        <nav className="sticky top-0 z-40 bg-[#07090f]/95 backdrop-blur border-b border-white/5 flex items-center justify-between px-4 h-13">
          <div className="font-black text-base text-[#00d4aa]" style={{ fontFamily: 'Syne, sans-serif' }}>
            Volt<span className="text-white">Station</span>
          </div>
          <div className="flex gap-1">
            {NAV_ITEMS.map(n => (
              <button key={n.id} onClick={() => setActive(n.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  active === n.id
                    ? n.id === 'live'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20'
                    : 'text-white/40 hover:text-white/70'
                }`}>
                {n.id === 'live' && active === 'live' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
                {n.label}
              </button>
            ))}
          </div>
          <button onClick={logout} className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1.5">
            <span className="text-xs">{user.name?.split(' ')[0]}</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/30">Sign out</span>
          </button>
        </nav>

        {/* Content */}
        {active === 'live'        && <LiveStatus toast={toast} />}
        {active === 'book'        && <BookSlot user={user} toast={toast} />}
        {active === 'mybookings'  && <MyBookings user={user} toast={toast} />}
        {active === 'analytics'   && <Analytics toast={toast} />}
        {active === 'shops'       && <Shops toast={toast} />}

        <Toast msg={msg} show={show} />
      </div>
    </>
  )
}
