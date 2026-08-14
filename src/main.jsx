import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted so the type is never blocked on a third-party request —
// the variable file covers every weight the design uses.
import '@fontsource-variable/inter'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
