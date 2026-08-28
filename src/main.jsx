import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted so the type is never blocked on a third-party request —
// the variable file covers every weight the design uses.
import '@fontsource-variable/inter'
import './index.css'
// The assistant's surface, after index.css so it wins the cascade. Kept
// separate because it is presentation for one component and had grown
// to several hundred lines buried at the bottom of a 6,900-line file.
import './styles/assistant.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
