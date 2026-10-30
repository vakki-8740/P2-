const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function Icon({ name, size = 20, ...rest }) {
  const Cmp = ICONS[name]
  if (!Cmp) return null
  return <Cmp width={size} height={size} {...base} {...rest} />
}

const Search = (p) => (<svg {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>)
const Sun = (p) => (<svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>)
const Moon = (p) => (<svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>)
const Check = (p) => (<svg {...p}><path d="M20 6L9 17l-5-5" /></svg>)
const X = (p) => (<svg {...p}><path d="M18 6L6 18M6 6l12 12" /></svg>)
const ChevronDown = (p) => (<svg {...p}><path d="M6 9l6 6 6-6" /></svg>)
const ChevronLeft = (p) => (<svg {...p}><path d="M15 18l-6-6 6-6" /></svg>)
const ChevronRight = (p) => (<svg {...p}><path d="M9 18l6-6-6-6" /></svg>)
const ArrowRight = (p) => (<svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>)
const ArrowLeft = (p) => (<svg {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>)
const Heart = (p) => (<svg {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>)
const Star = (p) => (<svg {...p}><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></svg>)
const Bell = (p) => (<svg {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>)
const Menu = (p) => (<svg {...p}><path d="M3 6h18M3 12h18M3 18h18" /></svg>)
const Copy = (p) => (<svg {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>)
const Plus = (p) => (<svg {...p}><path d="M12 5v14M5 12h14" /></svg>)
const Minus = (p) => (<svg {...p}><path d="M5 12h14" /></svg>)
const Home = (p) => (<svg {...p}><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>)
const Filter = (p) => (<svg {...p}><path d="M3 5h18l-7 8v6l-4-2v-4z" /></svg>)
const Info = (p) => (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></svg>)
const AlertTriangle = (p) => (<svg {...p}><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg>)
const CheckCircle = (p) => (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></svg>)
const XCircle = (p) => (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></svg>)
const Mail = (p) => (<svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 7l8.5 6 8.5-6" /></svg>)
const Lock = (p) => (<svg {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>)
const User = (p) => (<svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>)
const Upload = (p) => (<svg {...p}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>)
const Download = (p) => (<svg {...p}><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>)
const Trash = (p) => (<svg {...p}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" /></svg>)
const Settings = (p) => (<svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 2.6 14H2.5a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 2.6V2.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5.9h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5.9z" /></svg>)
const Grid = (p) => (<svg {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>)
const Layers = (p) => (<svg {...p}><path d="M12 2l10 5-10 5L2 7z" /><path d="M2 12l10 5 10-5M2 17l10 5 10-5" /></svg>)
const Message = (p) => (<svg {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>)
const Cart = (p) => (<svg {...p}><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.9a1.5 1.5 0 0 0 1.5-1.2L22 7H6" /></svg>)
const Shield = (p) => (<svg {...p}><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z" /><path d="M9 12l2 2 4-4" /></svg>)
const CreditCard = (p) => (<svg {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>)
const Folder = (p) => (<svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>)
const Image = (p) => (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>)
const Send = (p) => (<svg {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>)
const Bookmark = (p) => (<svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>)
const Clock = (p) => (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>)
const Logout = (p) => (<svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>)
const Eye = (p) => (<svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>)
const Sliders = (p) => (<svg {...p}><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="8" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>)
const Tag = (p) => (<svg {...p}><path d="M20.6 13.4L11 3.8A2 2 0 0 0 9.6 3.2H4a1 1 0 0 0-1 1v5.6a2 2 0 0 0 .6 1.4l9.6 9.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.8z" /><circle cx="7.5" cy="7.5" r="1.2" /></svg>)
const Pie = (p) => (<svg {...p}><path d="M21 12A9 9 0 1 1 12 3v9z" /><path d="M16 3.4A9 9 0 0 1 20.6 8H16z" /></svg>)
const Globe = (p) => (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" /></svg>)
const Phone = (p) => (<svg {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" /></svg>)

export const ICONS = {
  search: Search, sun: Sun, moon: Moon, check: Check, x: X,
  'chevron-down': ChevronDown, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  'arrow-right': ArrowRight, 'arrow-left': ArrowLeft, heart: Heart, star: Star, bell: Bell,
  menu: Menu, copy: Copy, plus: Plus, minus: Minus, home: Home, filter: Filter, info: Info,
  'alert-triangle': AlertTriangle, 'check-circle': CheckCircle, 'x-circle': XCircle,
  mail: Mail, lock: Lock, user: User, upload: Upload, trash: Trash, settings: Settings,
  grid: Grid, layers: Layers, message: Message, cart: Cart, shield: Shield, download: Download,
  'credit-card': CreditCard, folder: Folder, image: Image, send: Send, bookmark: Bookmark,
  clock: Clock, logout: Logout, eye: Eye, sliders: Sliders, tag: Tag, pie: Pie, globe: Globe,
  phone: Phone,
}
