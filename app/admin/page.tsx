'use client'
import { useEffect, useState, useCallback } from 'react'

const C = {
  bg:'#07090f',bg2:'#0d1117',bg3:'#141b26',card:'#0f1520',
  border:'rgba(255,255,255,0.06)',border2:'rgba(255,255,255,0.11)',
  text:'#eef2ff',text2:'#7c8db5',text3:'#4a5670',
  accent:'#00d4aa',accent2:'#0099ff',green:'#10b981',
  yellow:'#f59e0b',red:'#ef4444',orange:'#f97316',purple:'#7c3aed',
}

async function api(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('vs_admin_token')
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type':'application/json', ...(token?{Authorization:'Bearer '+token}:{}), ...(opts.headers||{}) },
  })
  if (res.status === 401) { localStorage.removeItem('vs_admin_token'); localStorage.removeItem('vs_admin'); window.location.reload(); return {} }
  return res.json()
}

function useToast() {
  const [msg, setMsg] = useState(''); const [show, setShow] = useState(false)
  const toast = useCallback((m:string)=>{ setMsg(m);setShow(true);setTimeout(()=>setShow(false),3000) },[])
  return { msg, show, toast }
}

function Spinner() {
  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'2.5rem',color:C.text3,gap:8,fontSize:13}}>
    <div style={{width:16,height:16,border:`2px solid ${C.border2}`,borderTopColor:C.accent,borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/>Loading...
  </div>
}

function Badge({status}:{status:string}) {
  const m:Record<string,[string,string]> = {
    available:['rgba(16,185,129,.15)','#34d399'],busy:['rgba(239,68,68,.15)','#f87171'],
    waiting:['rgba(245,158,11,.15)','#fbbf24'],maintenance:['rgba(249,115,22,.15)','#fb923c'],
    confirmed:['rgba(16,185,129,.15)','#34d399'],pending:['rgba(245,158,11,.15)','#fbbf24'],
    cancelled:['rgba(239,68,68,.15)','#f87171'],completed:['rgba(14,165,233,.15)','#38bdf8'],
    super_admin:['rgba(124,58,237,.15)','#a78bfa'],manager:['rgba(20,184,166,.15)','#2dd4bf'],
    operator:['rgba(14,165,233,.15)','#38bdf8'],in_progress:['rgba(239,68,68,.15)','#f87171'],
    scheduled:['rgba(245,158,11,.15)','#fbbf24'],done:['rgba(16,185,129,.15)','#34d399'],
    basic:['rgba(14,165,233,.15)','#38bdf8'],premium:['rgba(124,58,237,.15)','#a78bfa'],deluxe:['rgba(245,158,11,.15)','#fbbf24'],
  }
  const [bg,color]=m[status]||['rgba(255,255,255,0.07)',C.text3]
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 9px',borderRadius:20,fontSize:11,fontWeight:600,background:bg,color}}>● {status}</span>
}

function Tog({checked,onChange}:{checked:boolean;onChange:(v:boolean)=>void}) {
  return <div onClick={()=>onChange(!checked)} style={{position:'relative',width:36,height:20,borderRadius:20,background:checked?C.green:'rgba(255,255,255,0.08)',cursor:'pointer',transition:'background .2s',flexShrink:0}}>
    <div style={{position:'absolute',width:14,height:14,borderRadius:'50%',background:'#fff',top:3,left:checked?19:3,transition:'left .2s'}}/>
  </div>
}

function KPI({label,value,color=C.accent,sub}:{label:string;value:any;color?:string;sub?:string}) {
  return <div style={{position:'relative',background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:'14px 16px',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:color}}/>
    <div style={{fontSize:10,color:C.text3,textTransform:'uppercase',letterSpacing:'.6px',marginBottom:8}}>{label}</div>
    <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:800,color}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:C.text3,marginTop:4}}>{sub}</div>}
  </div>
}

const iStyle=():React.CSSProperties=>({width:'100%',padding:'9px 12px',background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:10,color:C.text,fontSize:13,outline:'none',fontFamily:"'DM Sans',sans-serif"})

function Fld({label,children}:{label:string;children:React.ReactNode}) {
  return <div style={{marginBottom:12}}><label style={{display:'block',fontSize:11,color:C.text2,marginBottom:5}}>{label}</label>{children}</div>
}

function Btn({label,onClick,v='p',sm}:{label:string;onClick:()=>void;v?:string;sm?:boolean}) {
  const s:Record<string,React.CSSProperties>={
    p:{background:C.accent,color:'#07090f',border:'none'},
    g:{background:'transparent',color:C.text2,border:`1px solid ${C.border2}`},
    d:{background:'rgba(239,68,68,.1)',color:C.red,border:'1px solid rgba(239,68,68,.2)'},
  }
  return <button onClick={onClick} style={{padding:sm?'4px 10px':'8px 16px',borderRadius:10,cursor:'pointer',fontSize:sm?11:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",...(s[v]||s.p)}}>{label}</button>
}

function Mdl({title,sub,children,onClose,onSave}:{title:string;sub?:string;children:React.ReactNode;onClose:()=>void;onSave:()=>void}) {
  return <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(8px)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
    <div style={{background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:20,padding:24,width:420,maxWidth:'95vw'}}>
      <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:16,marginBottom:4}}>{title}</div>
      {sub&&<div style={{color:C.text2,fontSize:12,marginBottom:16}}>{sub}</div>}
      {children}
      <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
        <Btn label="Cancel" onClick={onClose} v="g"/>
        <Btn label="Save" onClick={onSave}/>
      </div>
    </div>
  </div>
}

function BarC({data,color}:{data:{l:string;v:number}[];color?:string}) {
  const mx=Math.max(...data.map(d=>d.v),1)
  return <div style={{display:'flex',alignItems:'flex-end',gap:5,height:110}}>
    {data.map(d=><div key={d.l} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
      <span style={{fontSize:9,color:C.text2,fontWeight:600}}>{d.v}</span>
      <div style={{width:'100%',borderRadius:'3px 3px 0 0',background:color||C.accent,opacity:.85,height:`${(d.v/mx)*100}%`,minHeight:3}}/>
      <span style={{fontSize:9,color:C.text3}}>{d.l}</span>
    </div>)}
  </div>
}

function Alrt({icon,title,sub,t}:{icon:string;title:string;sub:string;t:'d'|'w'|'g'}) {
  const c={d:[C.red,'rgba(239,68,68,.07)'],w:[C.yellow,'rgba(245,158,11,.07)'],g:[C.green,'rgba(16,185,129,.07)']}
  const [bc,bg]=c[t]
  return <div style={{display:'flex',gap:10,padding:'10px 12px',borderRadius:10,marginBottom:8,background:bg,borderLeft:`3px solid ${bc}`}}>
    <span style={{fontSize:14}}>{icon}</span>
    <div><div style={{fontWeight:500,fontSize:13,marginBottom:2}}>{title}</div><div style={{fontSize:11,color:C.text3}}>{sub}</div></div>
  </div>
}

function QI({q,onRm,onSMS}:{q:any;onRm?:()=>void;onSMS?:()=>void}) {
  return <div style={{display:'flex',alignItems:'center',gap:12,background:'rgba(255,255,255,.02)',border:`1px solid ${C.border}`,borderRadius:14,padding:'11px 14px',marginBottom:8}}>
    <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(245,158,11,.12)',color:C.yellow,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:13,flexShrink:0}}>{q.position}</div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontWeight:500,fontSize:14}}>{q.car_model||'EV Car'} <span style={{color:C.text3,fontSize:11}}>·{q.car_plate}</span></div>
      <div style={{fontSize:11,color:C.text3,marginTop:1}}>{q.name} · {q.phone} · {q.charger_pref||'Any'}</div>
    </div>
    <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:13,color:C.yellow,flexShrink:0}}>~{20+q.position*15}min</div>
    {onSMS&&<button onClick={onSMS} style={{padding:'3px 9px',borderRadius:7,border:`1px solid ${C.border2}`,background:'transparent',color:C.text2,fontSize:11,cursor:'pointer'}}>SMS</button>}
    {onRm&&<button onClick={onRm} style={{padding:'3px 9px',borderRadius:7,border:'1px solid rgba(239,68,68,.25)',background:'rgba(239,68,68,.08)',color:C.red,fontSize:11,cursor:'pointer'}}>✕</button>}
  </div>
}

function Tbl({heads,rows}:{heads:string[];rows:React.ReactNode[]}) {
  return <div style={{overflowX:'auto'}}>
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr style={{background:'rgba(255,255,255,.02)'}}>
        {heads.map(h=><th key={h} style={{textAlign:'left',padding:'8px 14px',fontSize:10,color:C.text3,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',borderBottom:`1px solid ${C.border}`}}>{h}</th>)}
      </tr></thead>
      <tbody>{rows}</tbody>
    </table>
  </div>
}

function Td({children,muted,bold,color,small}:{children:React.ReactNode;muted?:boolean;bold?:boolean;color?:string;small?:boolean}) {
  return <td style={{padding:'10px 14px',fontSize:small?11:13,color:color||(muted?C.text2:C.text),fontWeight:bold?700:400,verticalAlign:'middle',borderBottom:`1px solid ${C.border}`}}>{children}</td>
}

// ── Dashboard ──────────────────────────────────────────────────────
function Dashboard({admin,toast}:{admin:any;toast:(m:string)=>void}) {
  const [rev,setRev]=useState<any>(null)
  const [chargers,setChargers]=useState<any[]>([])
  const [queue,setQueue]=useState<any[]>([])
  const [todaySess,setTodaySess]=useState(0)
  const load=useCallback(async()=>{
    const [rd,cd,qd,ad]=await Promise.all([api('/api/admin/revenue'),api('/api/admin/chargers'),api('/api/admin/queue'),api('/api/analytics')])
    if(rd.success)setRev(rd); if(cd.success)setChargers(cd.chargers||[]); if(qd.success)setQueue(qd.queue||[]); if(ad.success)setTodaySess(ad.today_sessions||0)
  },[])
  useEffect(()=>{load();const iv=setInterval(load,15000);return()=>clearInterval(iv)},[load])
  const busy=chargers.filter(c=>c.status==='busy').length
  const avail=chargers.filter(c=>c.status==='available').length
  const maint=chargers.filter(c=>c.status==='maintenance').length
  const wait=chargers.filter(c=>c.status==='waiting').length
  const sClr:Record<string,string>={available:'rgba(16,185,129,.18)',busy:'rgba(239,68,68,.18)',waiting:'rgba(245,158,11,.18)',maintenance:'rgba(249,115,22,.15)'}
  const sTxt:Record<string,string>={available:'#34d399',busy:'#f87171',waiting:'#fbbf24',maintenance:'#fb923c'}
  const mData=(rev?.monthly||[]).map((r:any)=>({l:r.month_name?.slice(0,3)||'',v:Math.round(Number(r.total||0)/1000)}))
  return <div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
      <KPI label="Revenue Today" value={`Rs.${Number(rev?.today||0).toLocaleString()}`} color={C.accent} sub="Today"/>
      <KPI label="Active Sessions" value={busy} color={C.red} sub="charging now"/>
      <KPI label="Sessions Today" value={todaySess} color={C.accent2} sub="growing"/>
      <KPI label="Queue Size" value={queue.length} color={C.yellow} sub="waiting"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,marginBottom:12}}>Monthly Revenue (Rs. K)</div>
        {mData.length?<BarC data={mData} color={C.accent2}/>:<div style={{height:110,display:'flex',alignItems:'center',justifyContent:'center',color:C.text3,fontSize:12}}>No data yet</div>}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,marginBottom:12}}>Station Alerts</div>
        {maint>0&&<Alrt icon="🔴" title={`${maint} Charger(s) in Maintenance`} sub="Needs inspection" t="d"/>}
        {queue.length>0&&<Alrt icon="🟡" title={`Queue: ${queue.length} cars waiting`} sub="Peak hours" t="w"/>}
        <Alrt icon="🟢" title="All systems normal" sub="Uptime 99.2%" t="g"/>
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,marginBottom:12}}>Charger Overview</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:5,marginBottom:10}}>
          {chargers.map(c=><div key={c.id} title={`${c.charger_code} — ${c.status}`} style={{height:28,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,cursor:'pointer',background:sClr[c.status]||'rgba(255,255,255,.05)',color:sTxt[c.status]||C.text3,border:`1px solid ${(sTxt[c.status]||C.text3)}33`}}>
            {c.charger_code?.replace('C-','')}
          </div>)}
        </div>
        <div style={{display:'flex',gap:14,fontSize:11}}>
          <span style={{color:'#34d399'}}>● {avail} Available</span>
          <span style={{color:'#f87171'}}>● {busy} Busy</span>
          <span style={{color:'#fbbf24'}}>● {wait} Waiting</span>
          <span style={{color:'#fb923c'}}>● {maint} Maint.</span>
        </div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,marginBottom:12}}>Queue Now</div>
        {queue.length===0?<div style={{textAlign:'center',padding:'1.5rem',color:C.text3,fontSize:13}}>🎉 No cars waiting</div>
          :queue.slice(0,3).map((q:any)=><QI key={q.id} q={q}/>)}
      </div>
    </div>
  </div>
}

// ── Chargers ───────────────────────────────────────────────────────
function Chargers({toast}:{toast:(m:string)=>void}) {
  const [ch,setCh]=useState<any[]>([]);const [loading,setLoading]=useState(true)
  const [showM,setShowM]=useState(false)
  const [form,setForm]=useState({charger_code:'',type:'DC_ULTRA',power_kw:150,bay_location:''})
  const load=async()=>{setLoading(true);const d=await api('/api/admin/chargers');setCh(d.chargers||[]);setLoading(false)}
  useEffect(()=>{load()},[])
  const tog=async(id:number,enabled:boolean)=>{await api(`/api/admin/chargers/${id}`,{method:'PATCH',body:JSON.stringify({enabled})});toast(`⚡ ${enabled?'Enabled':'Disabled'}`);load()}
  const setSt=async(id:number,status:string)=>{await api(`/api/admin/chargers/${id}`,{method:'PATCH',body:JSON.stringify({status})});toast(`🔧 ${status}`);load()}
  const add=async()=>{const d=await api('/api/admin/chargers',{method:'POST',body:JSON.stringify(form)});if(d.success){toast('✅ Added');setShowM(false);load()}else toast('❌ '+d.error)}
  const heads=['ID','Type','Power','Status','Sessions','Progress','Enabled','Actions']
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
      <div><div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18}}>Charger Management</div><div style={{fontSize:12,color:C.text2,marginTop:3}}>Monitor and control all chargers</div></div>
      <div style={{display:'flex',gap:8}}><Btn label="↻ Refresh" onClick={load} v="g" sm/><Btn label="+ Add Charger" onClick={()=>setShowM(true)}/></div>
    </div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:'hidden'}}>
      {loading?<Spinner/>:<Tbl heads={heads} rows={ch.map(c=>(
        <tr key={c.id} style={{borderBottom:`1px solid ${C.border}`}}>
          <Td bold color={C.accent}>{c.charger_code}</Td>
          <Td muted>{c.type?.replace('_',' ')}</Td>
          <Td bold color={C.accent}>{c.power_kw}kW</Td>
          <Td><Badge status={c.status}/></Td>
          <Td bold color={C.accent2}>{c.sessions_today||0}</Td>
          <Td>{c.status==='busy'?<div><div style={{fontSize:10,color:C.text3,marginBottom:3}}>{Math.min(99,Math.round(((c.elapsed_min||0)/45)*100))}%</div><div style={{height:3,background:C.border2,borderRadius:2,width:80,overflow:'hidden'}}><div style={{height:'100%',borderRadius:2,background:C.red,width:`${Math.min(99,Math.round(((c.elapsed_min||0)/45)*100))}%`}}/></div></div>:c.status==='maintenance'?<span style={{fontSize:11,color:C.orange}}>Under maint.</span>:<span style={{fontSize:11,color:C.green}}>Ready</span>}</Td>
          <Td><Tog checked={!!c.enabled} onChange={v=>tog(c.id,v)}/></Td>
          <Td><div style={{display:'flex',gap:5}}><Btn label="Maintain" onClick={()=>setSt(c.id,'maintenance')} v="g" sm/><Btn label="Free" onClick={()=>setSt(c.id,'available')} v="g" sm/></div></Td>
        </tr>
      ))}/>}
    </div>
    {showM&&<Mdl title="⚡ Add Charger" onClose={()=>setShowM(false)} onSave={add}>
      <Fld label="Charger Code"><input style={iStyle()} value={form.charger_code} onChange={e=>setForm({...form,charger_code:e.target.value})} placeholder="C-13"/></Fld>
      <Fld label="Type"><select style={iStyle()} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="DC_ULTRA">DC Ultra Fast (150kW)</option><option value="DC_FAST">DC Fast (50kW)</option><option value="AC_LEVEL2">AC Level 2 (22kW)</option></select></Fld>
      <Fld label="Power (kW)"><input style={iStyle()} type="number" value={form.power_kw} onChange={e=>setForm({...form,power_kw:+e.target.value})}/></Fld>
      <Fld label="Bay Location"><input style={iStyle()} value={form.bay_location} onChange={e=>setForm({...form,bay_location:e.target.value})} placeholder="Bay-A4"/></Fld>
    </Mdl>}
  </div>
}

// ── Queue Manager ──────────────────────────────────────────────────
function QueueMgr({toast}:{toast:(m:string)=>void}) {
  const [q,setQ]=useState<any[]>([]);const [loading,setLoading]=useState(true)
  const load=async()=>{setLoading(true);const d=await api('/api/admin/queue');setQ(d.queue||[]);setLoading(false)}
  useEffect(()=>{load();const iv=setInterval(load,10000);return()=>clearInterval(iv)},[])
  const rm=async(id:number)=>{await api(`/api/admin/queue/${id}`,{method:'DELETE'});toast('✅ Removed');load()}
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <div><div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18}}>Queue Manager</div><div style={{fontSize:12,color:C.text2,marginTop:3}}>Manage waiting cars in real-time</div></div>
      <span style={{background:'rgba(245,158,11,.1)',color:C.yellow,padding:'4px 14px',borderRadius:20,fontSize:13,fontWeight:700}}>{q.length} waiting</span>
    </div>
    {loading?<Spinner/>:q.length===0?<div style={{textAlign:'center',padding:'3rem',color:C.text3}}><div style={{fontSize:32,marginBottom:12}}>🎉</div>Queue is empty!</div>
      :q.map((qi:any)=><QI key={qi.id} q={qi} onRm={()=>rm(qi.id)} onSMS={()=>toast(`📱 SMS sent to ${qi.name}`)}/>)}
  </div>
}

// ── Bookings ───────────────────────────────────────────────────────
function Bookings({toast}:{toast:(m:string)=>void}) {
  const [bk,setBk]=useState<any[]>([]);const [loading,setLoading]=useState(true);const [filter,setFilter]=useState('')
  const load=async(st='')=>{setLoading(true);const d=await api(`/api/admin/bookings${st?'?status='+st:''}`);setBk(d.bookings||[]);setLoading(false)}
  useEffect(()=>{load()},[])
  const upd=async(id:number,status:string)=>{const d=await api(`/api/admin/bookings/${id}`,{method:'PATCH',body:JSON.stringify({status})});if(d.success){toast(`✅ ${status}`);load(filter)}}
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <div><div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18}}>All Bookings</div><div style={{fontSize:12,color:C.text2,marginTop:3}}>Manage reservations</div></div>
      <select style={{...iStyle(),width:'auto',padding:'7px 12px',fontSize:12}} value={filter} onChange={e=>{setFilter(e.target.value);load(e.target.value)}}>
        <option value="">All Status</option><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option>
      </select>
    </div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:'hidden'}}>
      {loading?<Spinner/>:<Tbl heads={['Booking ID','Customer','Car/Plate','Charger','Date & Time','Wash','Amount','Status','Actions']} rows={bk.map(b=>(
        <tr key={b.id} style={{borderBottom:`1px solid ${C.border}`}}>
          <Td bold color={C.accent}>{b.booking_ref}</Td>
          <Td><div style={{fontWeight:500,fontSize:13}}>{b.name||'—'}</div><div style={{fontSize:11,color:C.text3}}>{b.phone}</div></Td>
          <Td><div>{b.car_model||'—'}</div><div style={{fontSize:11,color:C.text3}}>{b.car_plate}</div></Td>
          <Td muted>{b.charger_code||'—'}</Td>
          <Td muted small>{b.booked_at?new Date(b.booked_at).toLocaleString():'—'}</Td>
          <Td>{b.wash_pkg?<Badge status={b.wash_pkg}/>:'—'}</Td>
          <Td bold>Rs.{b.estimated_amt||'—'}</Td>
          <Td><Badge status={b.status}/></Td>
          <Td><div style={{display:'flex',gap:5}}><Btn label="Approve" onClick={()=>upd(b.id,'confirmed')} sm/><Btn label="Cancel" onClick={()=>upd(b.id,'cancelled')} v="d" sm/></div></Td>
        </tr>
      ))}/>}
    </div>
  </div>
}

// ── Sessions ───────────────────────────────────────────────────────
function Sessions({toast}:{toast:(m:string)=>void}) {
  const [sess,setSess]=useState<any[]>([]);const [stats,setStats]=useState<any>(null);const [loading,setLoading]=useState(true)
  useEffect(()=>{ Promise.all([api('/api/admin/sessions'),api('/api/analytics')]).then(([d,a])=>{setSess(d.sessions||[]);if(a.success)setStats(a.stats);setLoading(false)}) },[])
  return <div>
    <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,marginBottom:4}}>Charging Sessions</div>
    <div style={{fontSize:12,color:C.text2,marginBottom:16}}>All completed and active sessions</div>
    {stats&&<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
      <KPI label="Total kWh" value={`${Math.round(stats.total_kwh||0)} kWh`} color={C.accent}/>
      <KPI label="Avg Duration" value={`${stats.avg_duration||0} min`} color={C.accent2}/>
      <KPI label="Avg Improvement" value={`+${Math.round(stats.avg_improvement||0)}%`} color={C.green}/>
    </div>}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:'hidden'}}>
      {loading?<Spinner/>:<Tbl heads={['Session ID','Customer','Charger','Start','Duration','Energy','Speed','Improvement','Revenue']} rows={sess.map(s=>(
        <tr key={s.id} style={{borderBottom:`1px solid ${C.border}`}}>
          <Td color={C.accent2} small>{s.session_ref}</Td>
          <Td><div style={{fontWeight:500,fontSize:13}}>{s.customer_name||'—'}</div><div style={{fontSize:11,color:C.text3}}>{s.car_plate}</div></Td>
          <Td muted small>{s.charger_code}·{s.power_kw}kW</Td>
          <Td muted small>{s.start_time?new Date(s.start_time).toLocaleTimeString():'—'}</Td>
          <Td><span style={{background:`${C.accent}18`,color:C.accent,padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>{s.duration_min||'—'} min</span></Td>
          <Td>{s.energy_kwh||'—'} kWh</Td>
          <Td bold color={C.accent}>{s.avg_speed_kw||'—'} kW</Td>
          <Td bold color={C.green}>{s.improvement_pct?'+'+s.improvement_pct+'%':'—'}</Td>
          <Td bold>Rs.{s.cost||'—'}</Td>
        </tr>
      ))}/>}
    </div>
  </div>
}

// ── Shops ──────────────────────────────────────────────────────────
function Shops({toast}:{toast:(m:string)=>void}) {
  const [shops,setShops]=useState<any[]>([]);const [loading,setLoading]=useState(true)
  const [showM,setShowM]=useState(false)
  const [form,setForm]=useState({name:'',type:'Food & Beverages',icon:'🏪',hours:'',revenue_share:5})
  const load=async()=>{setLoading(true);const d=await api('/api/admin/shops');setShops(d.shops||[]);setLoading(false)}
  useEffect(()=>{load()},[])
  const tog=async(id:number,is_open:boolean)=>{await api(`/api/admin/shops/${id}`,{method:'PATCH',body:JSON.stringify({is_open})});toast(`🏪 ${is_open?'Opened':'Closed'}`);load()}
  const rm=async(id:number)=>{if(!confirm('Remove shop?'))return;await api(`/api/admin/shops/${id}`,{method:'DELETE'});toast('🗑️ Removed');load()}
  const add=async()=>{const d=await api('/api/admin/shops',{method:'POST',body:JSON.stringify(form)});if(d.success){toast('✅ Added');setShowM(false);load()}else toast('❌ '+d.error)}
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <div><div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18}}>Shops Manager</div><div style={{fontSize:12,color:C.text2,marginTop:3}}>Manage all shops</div></div>
      <Btn label="+ Add Shop" onClick={()=>setShowM(true)}/>
    </div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:'hidden'}}>
      {loading?<Spinner/>:<Tbl heads={['Icon','Shop','Type','Hours','Rev. Share','Open','Actions']} rows={shops.map(s=>(
        <tr key={s.id} style={{borderBottom:`1px solid ${C.border}`}}>
          <Td><span style={{fontSize:22}}>{s.icon}</span></Td>
          <Td bold>{s.name}</Td>
          <Td muted>{s.type}</Td>
          <Td muted small>{s.hours}</Td>
          <Td bold color={C.accent}>{s.revenue_share}%</Td>
          <Td><Tog checked={!!s.is_open} onChange={v=>tog(s.id,v)}/></Td>
          <Td><Btn label="Remove" onClick={()=>rm(s.id)} v="d" sm/></Td>
        </tr>
      ))}/>}
    </div>
    {showM&&<Mdl title="🏪 Add Shop" onClose={()=>setShowM(false)} onSave={add}>
      <Fld label="Shop Name"><input style={iStyle()} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="My Café"/></Fld>
      <Fld label="Type"><select style={iStyle()} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
        {['Food & Beverages','Convenience Store','Car Accessories','Entertainment','Service','Pharmacy','Fast Food','Mobile Repair'].map(t=><option key={t}>{t}</option>)}
      </select></Fld>
      <Fld label="Icon (emoji)"><input style={iStyle()} value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} placeholder="☕" maxLength={4}/></Fld>
      <Fld label="Hours"><input style={iStyle()} value={form.hours} onChange={e=>setForm({...form,hours:e.target.value})} placeholder="8AM–10PM"/></Fld>
      <Fld label="Revenue Share %"><input style={iStyle()} type="number" value={form.revenue_share} onChange={e=>setForm({...form,revenue_share:+e.target.value})}/></Fld>
    </Mdl>}
  </div>
}

// ── Car Wash ───────────────────────────────────────────────────────
function CarWash({toast}:{toast:(m:string)=>void}) {
  const [washes,setWashes]=useState<any[]>([]);const [loading,setLoading]=useState(true)
  const load=async()=>{setLoading(true);const d=await api('/api/admin/carwash');setWashes(d.washes||[]);setLoading(false)}
  useEffect(()=>{load()},[])
  const upd=async(id:number,status:string)=>{const d=await api(`/api/admin/carwash/${id}`,{method:'PATCH',body:JSON.stringify({status})});if(d.success){toast(`🚿 ${status}`);load()}}
  const ip=washes.filter(w=>w.status==='in_progress').length
  const sc=washes.filter(w=>w.status==='scheduled').length
  const dn=washes.filter(w=>w.status==='done').length
  return <div>
    <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,marginBottom:4}}>Car Wash Manager</div>
    <div style={{fontSize:12,color:C.text2,marginBottom:16}}>Manage wash bookings and bays</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
      <KPI label="Total Washes" value={washes.length} color={C.accent2}/>
      <KPI label="In Progress"  value={ip} color={C.green}/>
      <KPI label="Scheduled"    value={sc} color={C.yellow}/>
      <KPI label="Completed"    value={dn} color={C.purple}/>
    </div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:'hidden'}}>
      {loading?<Spinner/>:<Tbl heads={['Customer','Car','Package','Price','Bay','Status','Actions']} rows={washes.map(w=>(
        <tr key={w.id} style={{borderBottom:`1px solid ${C.border}`}}>
          <Td bold>{w.name||'—'}</Td>
          <Td><div>{w.car_model||'—'}</div><div style={{fontSize:11,color:C.text3}}>{w.car_plate}</div></Td>
          <Td><Badge status={w.package}/></Td>
          <Td bold>Rs.{w.price}</Td>
          <Td color={C.accent2}>{w.bay||'—'}</Td>
          <Td><Badge status={w.status}/></Td>
          <Td><div style={{display:'flex',gap:5}}><Btn label="Start" onClick={()=>upd(w.id,'in_progress')} sm/><Btn label="Done" onClick={()=>upd(w.id,'done')} v="g" sm/></div></Td>
        </tr>
      ))}/>}
    </div>
  </div>
}

// ── Users ──────────────────────────────────────────────────────────
function Users({toast}:{toast:(m:string)=>void}) {
  const [users,setUsers]=useState<any[]>([]);const [loading,setLoading]=useState(true)
  const load=async(s='')=>{setLoading(true);const d=await api(`/api/admin/users?search=${encodeURIComponent(s)}`);setUsers(d.users||[]);setLoading(false)}
  useEffect(()=>{load()},[])
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <div><div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18}}>Users</div><div style={{fontSize:12,color:C.text2,marginTop:3}}>All registered customers</div></div>
      <input style={{...iStyle(),width:200}} placeholder="Search name / phone..." onChange={e=>load(e.target.value)}/>
    </div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:'hidden'}}>
      {loading?<Spinner/>:<Tbl heads={['Name','Phone','Car','Sessions','kWh','Spent','Member','Joined']} rows={users.map(u=>(
        <tr key={u.id} style={{borderBottom:`1px solid ${C.border}`}}>
          <Td bold>{u.name}</Td><Td muted>{u.phone}</Td><Td>{u.car_model||'—'}</Td>
          <Td bold color={C.accent2}>{u.actual_sessions||0}</Td>
          <Td>{u.total_kwh||0} kWh</Td>
          <Td bold>Rs.{Number(u.actual_spent||0).toLocaleString()}</Td>
          <Td>{u.is_member?<span style={{background:'rgba(124,58,237,.12)',color:'#a78bfa',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>⭐ Member</span>:'—'}</Td>
          <Td muted small>{u.created_at?new Date(u.created_at).toLocaleDateString():'—'}</Td>
        </tr>
      ))}/>}
    </div>
  </div>
}

// ── Revenue ────────────────────────────────────────────────────────
function Revenue({toast}:{toast:(m:string)=>void}) {
  const [data,setData]=useState<any>(null)
  useEffect(()=>{api('/api/admin/revenue').then(d=>{if(d.success)setData(d)})},[])
  if(!data)return <Spinner/>
  const mData=(data.monthly||[]).map((r:any)=>({l:r.month_name?.slice(0,3)||'',v:Math.round(Number(r.total||0)/1000)}))
  const total=(data.by_source||[]).reduce((a:number,s:any)=>a+Number(s.total||0),0)||1
  return <div>
    <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,marginBottom:4}}>Revenue</div>
    <div style={{fontSize:12,color:C.text2,marginBottom:16}}>Financial overview</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
      <KPI label="Today's Revenue" value={`Rs.${Number(data.today||0).toLocaleString()}`} color={C.accent}/>
      {(data.by_source||[]).slice(0,3).map((s:any)=><KPI key={s.source} label={s.source} value={`Rs.${Number(s.total||0).toLocaleString()}`} color={C.accent2}/>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,marginBottom:12}}>Monthly Revenue (Rs. K)</div>
        {mData.length?<BarC data={mData} color={C.accent}/>:<div style={{color:C.text3,fontSize:12,textAlign:'center',padding:'2rem'}}>No data yet</div>}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,marginBottom:12}}>Breakdown</div>
        {(data.by_source||[]).map((s:any)=><div key={s.source} style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:5}}>
            <span style={{color:C.text2}}>{s.source}</span>
            <span style={{fontWeight:700}}>Rs.{Number(s.total||0).toLocaleString()}</span>
          </div>
          <div style={{height:3,background:C.border2,borderRadius:2,overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:2,background:C.accent,width:`${Math.round((Number(s.total)||0)/total*100)}%`}}/>
          </div>
        </div>)}
      </div>
    </div>
  </div>
}

// ── Settings ───────────────────────────────────────────────────────
function TRow({label,sub,def,onT}:{label:string;sub:string;def:boolean;onT:(v:boolean)=>void}) {
  const [v,setV]=useState(def)
  return <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:`1px solid ${C.border}`}}>
    <div><div style={{fontSize:14,fontWeight:500}}>{label}</div><div style={{fontSize:11,color:C.text3,marginTop:2}}>{sub}</div></div>
    <Tog checked={v} onChange={nv=>{setV(nv);onT(nv)}}/>
  </div>
}

function Settings({admin,toast}:{admin:any;toast:(m:string)=>void}) {
  const [station,setStation]=useState<any>(null)
  const [form,setForm]=useState({name:'',address:'',open_hours:'',phone:''})
  const [showM,setShowM]=useState(false)
  const [af,setAf]=useState({name:'',username:'',password:'',role:'operator'})
  useEffect(()=>{api('/api/admin/settings').then(d=>{if(d.success){setStation(d.station);setForm({name:d.station.name||'',address:d.station.address||'',open_hours:d.station.open_hours||'',phone:d.station.phone||''})}})},[])
  const save=async()=>{const d=await api('/api/admin/settings',{method:'PATCH',body:JSON.stringify(form)});toast(d.success?'✅ Saved':'❌ '+d.error)}
  const addAdm=async()=>{const d=await api('/api/admin/admins',{method:'POST',body:JSON.stringify(af)});if(d.success){toast('✅ Admin created');setShowM(false)}else toast('❌ '+d.error)}
  return <div>
    <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,marginBottom:16}}>Settings</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <div>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,marginBottom:10}}>Station Info</div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16,marginBottom:12}}>
          {!station?<Spinner/>:<>
            <Fld label="Station Name"><input style={iStyle()} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Fld>
            <Fld label="Address"><input style={iStyle()} value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></Fld>
            <Fld label="Open Hours"><input style={iStyle()} value={form.open_hours} onChange={e=>setForm({...form,open_hours:e.target.value})}/></Fld>
            <Fld label="Phone"><input style={iStyle()} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></Fld>
            <Btn label="Save Changes" onClick={save}/>
          </>}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14}}>Admin Accounts</div>
          {admin?.role==='super_admin'&&<Btn label="+ Add Admin" onClick={()=>setShowM(true)} sm/>}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(124,58,237,.15)',color:'#a78bfa',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800}}>
              {admin?.name?.split(' ').map((w:string)=>w[0]).join('').toUpperCase().slice(0,2)}
            </div>
            <div><div style={{fontWeight:500,fontSize:14}}>{admin?.name}</div><div style={{color:C.text3,fontSize:11}}>{admin?.username}</div></div>
            <div style={{marginLeft:'auto'}}><Badge status={admin?.role||'operator'}/></div>
          </div>
        </div>
      </div>
      <div>
        <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,marginBottom:10}}>System Toggles</div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:16}}>
          <TRow label="Online Booking" sub="Allow customers to book online" def={true} onT={v=>toast(`Online Booking: ${v?'ON':'OFF'}`)}/>
          <TRow label="SMS Notifications" sub="Auto SMS on booking/queue" def={true} onT={v=>toast(`SMS: ${v?'ON':'OFF'}`)}/>
          <TRow label="Walk-in Allowed" sub="Accept non-booked customers" def={true} onT={v=>toast(`Walk-in: ${v?'ON':'OFF'}`)}/>
          <TRow label="Maintenance Mode" sub="Show maintenance notice" def={false} onT={v=>toast(`Maintenance: ${v?'ON':'OFF'}`)}/>
        </div>
      </div>
    </div>
    {showM&&<Mdl title="👤 Add Admin" onClose={()=>setShowM(false)} onSave={addAdm}>
      <Fld label="Full Name"><input style={iStyle()} value={af.name} onChange={e=>setAf({...af,name:e.target.value})} placeholder="Ali Manager"/></Fld>
      <Fld label="Username"><input style={iStyle()} value={af.username} onChange={e=>setAf({...af,username:e.target.value})} placeholder="ali.mgr"/></Fld>
      <Fld label="Password"><input style={iStyle()} type="password" value={af.password} onChange={e=>setAf({...af,password:e.target.value})}/></Fld>
      <Fld label="Role"><select style={iStyle()} value={af.role} onChange={e=>setAf({...af,role:e.target.value})}><option value="operator">Operator</option><option value="manager">Manager</option><option value="super_admin">Super Admin</option></select></Fld>
    </Mdl>}
  </div>
}

// ── Login ──────────────────────────────────────────────────────────
function Login({onLogin}:{onLogin:(admin:any,token:string)=>void}) {
  const [username,setUsername]=useState('');const [password,setPassword]=useState('')
  const [err,setErr]=useState('');const [loading,setLoading]=useState(false)
  const doLogin=async()=>{
    if(!username||!password){setErr('Username and password required');return}
    setLoading(true);setErr('')
    try {
      const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})})
      const d=await res.json()
      if(!d.success){setErr(d.error);setLoading(false);return}
      onLogin(d.admin,d.token)
    }catch{setErr('Cannot connect to server');setLoading(false)}
  }
  return <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',backgroundImage:`radial-gradient(circle at 25% 50%, rgba(0,212,170,0.04), transparent 60%)`}}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{width:400,maxWidth:'95vw',background:C.card,border:`1px solid ${C.border2}`,borderRadius:24,padding:32,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${C.accent},${C.accent2})`}}/>
      <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:24,color:C.accent,marginBottom:4}}>Volt<span style={{color:C.text}}>Station</span></div>
      <div style={{color:C.text3,fontSize:12,marginBottom:6}}>Admin Control Panel — Restricted</div>
      <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(124,58,237,0.12)',color:'#a78bfa',border:'1px solid rgba(124,58,237,0.2)',borderRadius:20,padding:'3px 12px',fontSize:11,marginBottom:20}}>🔒 Admins Only</div>
      {err&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,padding:'10px 14px',color:C.red,fontSize:13,marginBottom:14}}>{err}</div>}
      <Fld label="Username"><input style={iStyle()} value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin" onKeyDown={e=>e.key==='Enter'&&doLogin()}/></Fld>
      <Fld label="Password"><input style={iStyle()} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&doLogin()}/></Fld>
      <button onClick={doLogin} disabled={loading} style={{width:'100%',padding:'12px',background:C.accent,color:'#07090f',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',marginTop:4,opacity:loading?0.6:1}}>
        {loading?'Signing in...':'Sign In'}
      </button>
      <div style={{marginTop:14,padding:'10px 14px',background:`${C.accent}0a`,borderRadius:10,fontSize:12,color:C.text3}}>
        🔑 Default: <strong style={{color:C.text}}>admin</strong> / <strong style={{color:C.text}}>volt2025</strong>
      </div>
    </div>
  </div>
}

// ── Main App ───────────────────────────────────────────────────────
const NAV=[
  {id:'dashboard',icon:'📊',label:'Dashboard'},{id:'chargers',icon:'⚡',label:'Chargers'},
  {id:'queue',icon:'🔄',label:'Queue Manager'},{id:'bookings',icon:'📅',label:'All Bookings'},
  {id:'sessions',icon:'🔌',label:'Sessions'},{id:'shops',icon:'🏪',label:'Shops Manager'},
  {id:'carwash',icon:'🚿',label:'Car Wash'},{id:'users',icon:'👥',label:'Users'},
  {id:'revenue',icon:'💰',label:'Revenue'},{id:'settings',icon:'⚙️',label:'Settings'},
]

export default function AdminApp() {
  const [admin,setAdmin]=useState<any>(null)
  const [active,setActive]=useState('dashboard')
  const [clock,setClock]=useState('')
  const {msg,show,toast}=useToast()

  useEffect(()=>{
    const t=localStorage.getItem('vs_admin_token')
    const a=localStorage.getItem('vs_admin')
    if(t&&a){setAdmin(JSON.parse(a))}
    const iv=setInterval(()=>setClock(new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})),1000)
    return()=>clearInterval(iv)
  },[])

  const handleLogin=(a:any,t:string)=>{localStorage.setItem('vs_admin_token',t);localStorage.setItem('vs_admin',JSON.stringify(a));setAdmin(a)}
  const handleLogout=()=>{if(!confirm('Sign out?'))return;localStorage.removeItem('vs_admin_token');localStorage.removeItem('vs_admin');setAdmin(null)}
  if(!admin)return <Login onLogin={handleLogin}/>

  const initials=admin.name?.split(' ').map((w:string)=>w[0]).join('').toUpperCase().slice(0,2)||'SA'
  const label=NAV.find(n=>n.id===active)?.label||''

  const sec=()=>{
    switch(active){
      case 'dashboard': return <Dashboard admin={admin} toast={toast}/>
      case 'chargers':  return <Chargers  toast={toast}/>
      case 'queue':     return <QueueMgr  toast={toast}/>
      case 'bookings':  return <Bookings  toast={toast}/>
      case 'sessions':  return <Sessions  toast={toast}/>
      case 'shops':     return <Shops     toast={toast}/>
      case 'carwash':   return <CarWash   toast={toast}/>
      case 'users':     return <Users     toast={toast}/>
      case 'revenue':   return <Revenue   toast={toast}/>
      case 'settings':  return <Settings  admin={admin} toast={toast}/>
      default:          return null
    }
  }

  return <>
    <style>{`
      @keyframes spin{to{transform:rotate(360deg)}}
      *{box-sizing:border-box;margin:0;padding:0;}
      body{background:#07090f;color:#eef2ff;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1a2233;border-radius:2px}
      button:focus,input:focus,select:focus{outline:none}
      input:focus,select:focus{border-color:rgba(0,212,170,0.5)!important}
    `}</style>
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:C.bg,color:C.text,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      {/* Sidebar */}
      <aside style={{width:220,background:C.bg2,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden'}}>
        <div style={{padding:'16px',borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:16,color:C.accent}}>Volt<span style={{color:C.text}}>Station</span></div>
          <div style={{fontSize:10,color:C.text3,marginTop:2}}>Admin Control Panel</div>
        </div>
        <nav style={{flex:1,overflowY:'auto',padding:'8px'}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setActive(n.id)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:10,border:'none',background:active===n.id?`${C.accent}18`:'transparent',color:active===n.id?C.accent:C.text2,fontSize:13,cursor:'pointer',marginBottom:2,textAlign:'left',fontFamily:"'DM Sans',sans-serif",fontWeight:active===n.id?600:400}}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div style={{padding:'12px',borderTop:`1px solid ${C.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(124,58,237,.15)',color:'#a78bfa',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,flexShrink:0}}>{initials}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{admin.name}</div>
              <div style={{fontSize:10,color:C.text3}}>{admin.role}</div>
            </div>
            <button onClick={handleLogout} title="Sign out" style={{background:'transparent',border:'none',color:C.text3,cursor:'pointer',fontSize:14,padding:4}}>⎋</button>
          </div>
        </div>
      </aside>
      {/* Main */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{height:52,background:C.bg2,borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',flexShrink:0}}>
          <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:15}}>{label}</div>
          <div style={{display:'flex',alignItems:'center',gap:14,fontSize:12,color:C.text2}}>
            <span style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:C.green,display:'inline-block'}}/>Live
            </span>
            <span style={{color:C.text3}}>{clock}</span>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:20}}>{sec()}</div>
      </div>
      {/* Toast */}
      <div style={{position:'fixed',bottom:20,right:20,zIndex:999,background:C.card,border:`1px solid ${C.border2}`,borderLeft:`2px solid ${C.accent}`,borderRadius:12,padding:'10px 16px',fontSize:13,maxWidth:280,transition:'all .28s',transform:show?'translateY(0)':'translateY(60px)',opacity:show?1:0,pointerEvents:show?'auto':'none'}}>{msg}</div>
    </div>
  </>
}
