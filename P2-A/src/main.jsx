import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './own/styles/global.css'   // OWN Library tokens + base
import './app.css'                // P2-A mobile shell
import { applyTheme, getTheme } from './lib/prefs.js'

applyTheme(getTheme())            // saved OWN Library theme

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
