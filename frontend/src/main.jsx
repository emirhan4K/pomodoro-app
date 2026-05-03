import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { PomodoroProvider } from './context/PomodoroContext.jsx' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <PomodoroProvider> 
        <App />
      </PomodoroProvider>
    </AuthProvider>
  </React.StrictMode>,
)