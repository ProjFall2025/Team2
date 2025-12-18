import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { Login } from './pages/Login'
import { SignUp } from './pages/SignUp'
import { Events } from './pages/Events'
import { PublicEvents } from './pages/PublicEvents'
import { EventDetails } from './pages/EventDetails'
import type { Event } from './types/Event'
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 left-10 text-4xl text-blue-200 opacity-60 animate-pulse">❄️</div>
        <div className="absolute top-20 right-20 text-5xl text-cyan-200 opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}>❄️</div>
        <div className="absolute bottom-20 left-1/4 text-3xl text-blue-100 opacity-40 animate-pulse" style={{ animationDelay: '1s' }}>❄️</div>
        <div className="text-white text-3xl font-bold flex items-center gap-3">
          <span className="animate-spin">❄️</span>
          <span>Loading your winter experience...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppContent() {
  const { session, loading } = useAuth()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 left-10 text-4xl text-blue-200 opacity-60 animate-pulse">❄️</div>
        <div className="absolute top-20 right-20 text-5xl text-cyan-200 opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}>❄️</div>
        <div className="absolute bottom-20 left-1/4 text-3xl text-blue-100 opacity-40 animate-pulse" style={{ animationDelay: '1s' }}>❄️</div>
        <div className="text-white text-3xl font-bold flex items-center gap-3">
          <span className="animate-spin">❄️</span>
          <span>Loading your winter experience...</span>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<PublicEvents />} />
      <Route path="/login" element={!session ? <Login onSwitchToSignUp={() => {}} /> : <Navigate to="/events" replace />} />
      <Route path="/signup" element={!session ? <SignUp onSwitchToLogin={() => {}} /> : <Navigate to="/events" replace />} />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            {selectedEvent ? (
              <EventDetails event={selectedEvent} onBack={() => setSelectedEvent(null)} isProtected={true} />
            ) : (
              <Events onSelectEvent={setSelectedEvent} />
            )}
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
