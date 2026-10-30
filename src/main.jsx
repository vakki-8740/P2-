import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import '../Site/src/own-library.css'
import '../Site/src/index.css'
import { warmUp } from '../Site/src/utils/api'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Firebase connection shuru kar do — pehli complaint fast submit hogi.
warmUp()
