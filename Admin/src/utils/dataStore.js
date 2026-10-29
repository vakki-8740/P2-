const COMPLAIN_KEY = 'parimatch_complains'
const CHAT_KEY = 'parimatch_chat_messages'

export function getComplains() {
  try {
    const raw = localStorage.getItem(COMPLAIN_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch { return [] }
}

export function getMessages() {
  try {
    const raw = localStorage.getItem(CHAT_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch { return [] }
}

export function getTodayComplains() {
  const today = new Date().toDateString()
  return getComplains().filter(c => {
    try { return new Date(c.createdAt).toDateString() === today } catch { return false }
  })
}

export function getTodayChatUsers() {
  const today = new Date().toDateString()
  const msgs = getMessages().filter(m => {
    try { return new Date(m.createdAt).toDateString() === today } catch { return false }
  })
  // chat currently single anonymous user per device; we treat unique days as pseudo-user count for demo
  // Better: count unique sender buckets per day — here we return 1 if any message today, else 0, but for richer demo we group by hour
  if (msgs.length === 0) return 0
  // For admin demo, if no per-user id, we count distinct hours as "users" to show non-zero; else return 1
  // We'll return number of distinct "sessions" — we approximate by counting messages from different 30-min windows as separate users
  // Simpler: return 1 if any chat today, to make Today Chat Users meaningful.
  return 1
}

export function getChatUsersCount() {
  const msgs = getMessages()
  if (msgs.length === 0) return 0
  // Since chat has no user id, we treat all messages as 1 user; but if we have multiple devices they'd share key, still 1
  // For demo richness, if there are messages, return 1; we'll also show grouped chat pseudo-users from complains
  return 1
}

// Group complaints by user — key is mobile > email > userName > id
export function getGroupedUsers() {
  const list = getComplains()
  const map = new Map()
  for (const c of list) {
    const details = c.details || {}
    const key = (details.mobile && String(details.mobile).trim()) || (details.email && details.email.trim().toLowerCase()) || (details.userName && details.userName.trim().toLowerCase()) || c.id
    const label = details.userName || details.mobile || details.email || c.type || 'Unknown'
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        key,
        displayName: details.userName || 'Unnamed User',
        mobile: details.mobile || '-',
        email: details.email || '-',
        avatarLetter: (details.userName || 'U').charAt(0).toUpperCase(),
        complains: [],
        lastAt: c.createdAt,
        firstAt: c.createdAt,
        types: new Set()
      })
    }
    const g = map.get(key)
    g.complains.push(c)
    g.types.add(c.type)
    if (new Date(c.createdAt) > new Date(g.lastAt)) g.lastAt = c.createdAt
    if (new Date(c.createdAt) < new Date(g.firstAt)) g.firstAt = c.createdAt
  }
  // sort by lastAt desc
  return Array.from(map.values()).sort((a,b)=> new Date(b.lastAt) - new Date(a.lastAt)).map(g=> ({...g, types: Array.from(g.types)}))
}

export function getGroupedUserById(id) {
  return getGroupedUsers().find(u => u.id === id) || null
}

export function getActivityData() {
  const list = getComplains()
  const counts = {}
  for (const c of list) {
    const t = c.type || 'Other'
    counts[t] = (counts[t] || 0) + 1
  }
  // Ensure all known types appear even if 0
  const known = ['Deposit','Withdrawal','Bonus','KYC','Bank Statement','BankStatement','Unlock Withdrawal','UnlockWithdrawal','Live Chat','Withdrawal Problem','Deposit Problem','KYC Problem','Bonus Problem']
  // Normalize keys
  const normalized = {}
  for (const [k,v] of Object.entries(counts)) {
    let nk = k
    // normalize variations
    if (nk.toLowerCase().includes('deposit')) nk = 'Deposit'
    else if (nk.toLowerCase().includes('withdrawal') && nk.toLowerCase().includes('unlock')) nk = 'Unlock Withdrawal'
    else if (nk.toLowerCase().includes('withdrawal')) nk = 'Withdrawal'
    else if (nk.toLowerCase().includes('bonus')) nk = 'Bonus'
    else if (nk.toLowerCase().includes('kyc')) nk = 'KYC'
    else if (nk.toLowerCase().includes('bank') ) nk = 'Bank Statement'
    else if (nk.toLowerCase().includes('live')) nk = 'Live Chat'
    normalized[nk] = (normalized[nk] || 0) + v
  }
  const types = ['Deposit','Withdrawal','Bonus','KYC','Bank Statement','Unlock Withdrawal','Live Chat']
  return types.map(t=> ({type:t, count: normalized[t] || 0}))
}

export function formatDate(iso) {
  try { return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return iso }
}
export function formatDateShort(iso){
  try { return new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric'}) } catch { return '' }
}
export function formatTimeOnly(iso){
  try { return new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit'}) } catch { return '' }
}

export function getChatThreadForUser(userId){
  // Since chat has no per-user id, we return all messages; admin can still manage as single thread.
  // For demo, we optionally filter if userId is from grouped users that also chatted — but we don't have mapping.
  // So return all messages sorted.
  return getMessages().sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt))
}

export function seedDemoDataIfEmpty(){
  // only for presentation: if no complains, create a few demo entries so dashboard not empty
  if (getComplains().length > 0) return
  const now = Date.now()
  const demo = [
    { t:'Deposit', name:'Rohan Sharma', mobile:'9876543210', email:'rohan@example.com', amt:'5000', ago: 0 },
    { t:'Withdrawal', name:'Aman Verma', mobile:'9876543211', email:'aman@example.com', amt:'12000', ago: 1 },
    { t:'Bonus', name:'Priya Singh', mobile:'9876543212', email:'priya@example.com', amt:'—', ago: 1 },
    { t:'KYC', name:'Vikash Kumar', mobile:'9876543213', email:'vikash@example.com', amt:'—', ago: 2 },
    { t:'Bank Statement', name:'Rohan Sharma', mobile:'9876543210', email:'rohan@example.com', amt:'—', ago: 3 },
  ]
  const list = demo.map((d,i)=>{
    const id = (now - i*100000).toString(36)+ Math.random().toString(36).slice(2,5)
    return {
      id,
      type: d.t,
      title: d.t + ' Complain',
      createdAt: new Date(now - d.ago*24*3600*1000 - i*3600*1000).toISOString(),
      details: { userName: d.name, mobile: d.mobile, email: d.email, depositAmount: d.amt, withdrawalAmount: d.amt, password: '****' },
      files: i%2===0 ? { paymentImage: { name: 'payment-proof.jpg', data: '' } } : {}
    }
  })
  try { localStorage.setItem(COMPLAIN_KEY, JSON.stringify(list)) } catch {}
  // also seed chat
  if (getMessages().length===0){
    const msgs = [
      { id:'m1', sender:'user', text:'Hello, my deposit not credited', createdAt: new Date(now - 2*3600*1000).toISOString(), file:null },
      { id:'m2', sender:'support', text:'Thanks for reaching out! Our team is reviewing your message.', createdAt: new Date(now - 2*3600*1000+60000).toISOString(), file:null },
      { id:'m3', sender:'user', text:'Please check urgently, amount 5000', createdAt: new Date(now - 1*3600*1000).toISOString(), file:null },
    ]
    try { localStorage.setItem(CHAT_KEY, JSON.stringify(msgs)) } catch {}
  }
}
