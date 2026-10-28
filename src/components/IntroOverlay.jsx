import { useEffect, useState } from 'react'

export default function IntroOverlay() {
  const [visible, setVisible] = useState(true)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    document.body.classList.add('intro-active')
    const timer = setTimeout(() => {
      setFade(true)
      setTimeout(() => {
        setVisible(false)
        document.body.classList.remove('intro-active')
      }, 650)
    }, 1150)

    const handleClick = () => {
      setFade(true)
      setTimeout(() => {
        setVisible(false)
        document.body.classList.remove('intro-active')
      }, 650)
    }

    const el = document.getElementById('introOverlay')
    if (el) el.addEventListener('click', handleClick)

    return () => {
      clearTimeout(timer)
      document.body.classList.remove('intro-active')
      if (el) el.removeEventListener('click', handleClick)
    }
  }, [])

  if (!visible) return null

  return (
    <div id="introOverlay" className={fade ? 'fade-out' : ''}>
      <iframe src="/opening/Intro-Animation.html" title="Parimatch Intro" allowTransparency="true" />
    </div>
  )
}
