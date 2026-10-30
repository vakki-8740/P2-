import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './own-library.css'
import './index.css'
import { warmUp } from './utils/api'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Firebase connection shuru kar do — pehli complaint fast submit hogi.
warmUp()
