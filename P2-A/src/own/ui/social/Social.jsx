import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import { Avatar } from '../data/Avatar.jsx'
import './Social.css'

const MESSAGES = [
  { id: 1, mine: false, name: 'Priya', text: 'Bhai, new theme tokens push kar diye — check kar lena.' },
  { id: 2, mine: true, name: 'Me', text: 'Haan, abhi dekh raha hoon. Dark theme values perfect lag rahi hain.' },
  { id: 3, mine: false, name: 'Priya', text: 'Great! Teal theme bhi same tokens se chal rahi hai, koi extra CSS nahi.' },
  { id: 4, mine: true, name: 'Me', text: 'Perfect. Components without any change theme follow kar rahe hain.' },
]

export function ChatBubbles() {
  return (
    <div className="own-chat">
      {MESSAGES.map((m) => (
        <div key={m.id} className={`own-chat__row${m.mine ? ' own-chat__row--mine' : ''}`}>
          {!m.mine && <Avatar initials={m.name[0]} size="sm" tone="success" />}
          <div className={`own-chat__bubble own-chat__bubble--${m.mine ? 'mine' : 'theirs'}`}>
            {!m.mine && <span className="own-chat__name">{m.name}</span>}
            <p>{m.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChatComposer() {
  const [text, setText] = useState('')
  return (
    <form className="own-composer" onSubmit={(e) => { e.preventDefault(); setText('') }}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" aria-label="Message" />
      <button type="submit" aria-label="Send message" disabled={!text.trim()}><Icon name="send" size={17} /></button>
    </form>
  )
}

export function ReactionBar() {
  const [picked, setPicked] = useState('like')
  const reactions = [
    { id: 'like', label: 'Like', icon: 'heart' },
    { id: 'celebrate', label: 'Celebrate', icon: 'star' },
    { id: 'support', label: 'Support', icon: 'shield' },
    { id: 'insightful', label: 'Insightful', icon: 'info' },
  ]
  return (
    <div className="own-reactions" role="group" aria-label="Reactions">
      {reactions.map((r) => (
        <button
          key={r.id}
          type="button"
          className={`own-reactions__btn${picked === r.id ? ' is-on' : ''}`}
          aria-pressed={picked === r.id}
          onClick={() => setPicked(r.id)}
        >
          <Icon name={r.icon} size={15} /> {r.label}
        </button>
      ))}
    </div>
  )
}

const COMMENTS = [
  { id: 1, initials: 'AK', name: 'Aman Kumar', time: '2h', text: 'The token-based theming makes adding a new theme trivial. Great work.' },
  { id: 2, initials: 'RV', name: 'Rohit Verma', time: '45m', text: 'Copy-code feature with separate JSX and CSS tabs is exactly what we needed.' },
]

export function CommentSection() {
  const [list, setList] = useState(COMMENTS)
  const [text, setText] = useState('')
  return (
    <div className="own-comments">
      <h3 className="own-comments__title">{list.length} comments</h3>
      <form
        className="own-comments__form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          setList((c) => [...c, { id: Date.now(), initials: 'ME', name: 'You', time: 'now', text: text.trim() }])
          setText('')
        }}
      >
        <Avatar initials="ME" size="sm" />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment…" aria-label="Add a comment" />
        <button type="submit" className="own-comments__post">Post</button>
      </form>
      <ul className="own-comments__list">
        {list.map((c) => (
          <li key={c.id} className="own-comments__item">
            <Avatar initials={c.initials} size="sm" tone={c.initials === 'ME' ? 'accent' : 'warning'} />
            <div className="own-comments__body">
              <div className="own-comments__head"><strong>{c.name}</strong><span>{c.time}</span></div>
              <p>{c.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProfileHeader() {
  return (
    <div className="own-profile">
      <div className="own-profile__cover" />
      <div className="own-profile__main">
        <span className="own-profile__avatar">AK</span>
        <div className="own-profile__meta">
          <h3>Aman Kumar</h3>
          <p>Product Designer · Jaipur, India</p>
          <div className="own-profile__stats">
            <span><strong>128</strong> components</span>
            <span><strong>12</strong> themes</span>
            <span><strong>9</strong> projects</span>
          </div>
        </div>
        <div className="own-profile__actions">
          <button type="button" className="own-profile__btn own-profile__btn--primary">Follow</button>
          <button type="button" className="own-profile__btn">Message</button>
        </div>
      </div>
    </div>
  )
}
