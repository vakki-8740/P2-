import { useEffect, useState } from 'react'
import { getActivityData, getComplains } from '../utils/dataStore.js'

const colors = ['#F59e0b','#0ea5e9','#8b5cf6','#ec4899','#22c55e','#f97316','#06b6d4']

export default function Activity(){
  const [data,setData]=useState([])
  const [total,setTotal]=useState(0)
  const load=()=>{ const d=getActivityData(); setData(d); setTotal(d.reduce((s,x)=>s+x.count,0)) }
  useEffect(()=>{ load(); const h=()=>load(); window.addEventListener('storage',h); window.addEventListener('complains-updated',h); return ()=>{ window.removeEventListener('storage',h); window.removeEventListener('complains-updated',h)} },[])

  const max = Math.max(1, ...data.map(d=>d.count))

  return (
    <div>
      <h1 style={{fontWeight:800, fontSize:'1.3rem'}}>Complaint Activity</h1>
      <p style={{color:'var(--admin-muted)', fontSize:'.85rem', marginTop:4}}>Which types of complaints are most frequent — bar + pie overview</p>

      <div className="admin-card" style={{marginTop:16}}>
        <div className="admin-card-head"><h2>By Type — Count</h2><span style={{fontSize:'.82rem', color:'var(--admin-muted)'}}>Total: {total}</span></div>
        <div className="admin-card-body">
          <div className="chart-wrap">
            {data.map((d,i)=>(
              <div key={d.type} className="bar-row">
                <div className="bar-label">{d.type}</div>
                <div className="bar-track"><div className="bar-fill" style={{width: `${(d.count/max)*100}%`, background: colors[i%colors.length]}} /></div>
                <div className="bar-count">{d.count}</div>
              </div>
            ))}
            {total===0 && <div className="empty-admin">No data yet — when users submit, activity will appear</div>}
          </div>

          <div style={{marginTop:20, display:'flex', gap:16, flexWrap:'wrap', alignItems:'center'}}>
            <div style={{width:140, height:140, borderRadius:'50%', background:`conic-gradient(${data.map((d,i)=> `${colors[i%colors.length]} ${(data.slice(0,i).reduce((s,x)=>s+x.count,0)/ (total||1))*100}% ${(data.slice(0,i+1).reduce((s,x)=>s+x.count,0)/ (total||1))*100}%`).join(', ')})`, border:'2px solid var(--admin-border)'}} />
            <div className="pie-legend">
              {data.map((d,i)=>(
                <div key={d.type} className="legend-item"><span className="legend-dot" style={{background:colors[i%colors.length]}} /> {d.type} — {d.count} {total? `(${Math.round(d.count/total*100)}%)`:''}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{marginTop:14}}>
        <div className="admin-card-head"><h2>Most Complaint Type</h2></div>
        <div className="admin-card-body">
          {total===0 ? <div className="empty-admin">No complaints yet</div> : (()=>{ const top=[...data].sort((a,b)=>b.count-a.count)[0]; return <div style={{display:'flex', alignItems:'center', gap:12}}><span style={{width:44,height:44, borderRadius:12, background:'var(--admin-primary)', color:'var(--admin-primary-text)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800}}>1</span><div><div style={{fontWeight:800}}>{top.type}</div><div style={{fontSize:'.82rem', color:'var(--admin-muted)'}}>{top.count} complaints — highest</div></div></div> })()}
        </div>
      </div>
    </div>
  )
}
