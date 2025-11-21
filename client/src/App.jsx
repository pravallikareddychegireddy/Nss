import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './context/AuthContext'

import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import CreateEvent from './pages/CreateEvent'
import MyParticipations from './pages/MyParticipations'
import Students from './pages/Students'
import Participations from './pages/Participations'
import Profile from './pages/Profile'
import FinalCertificates from './pages/FinalCertificates'

function App() {
  const { user } = useAuth()

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <ToastContainer position="top-right" autoClose={3000} />
        
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/events" element={user ? <Events /> : <Navigate to="/login" />} />
          <Route path="/events/:id" element={user ? <EventDetails /> : <Navigate to="/login" />} />
          <Route path="/create-event" element={user && (user.role === 'admin' || user.role === 'faculty') ? <CreateEvent /> : <Navigate to="/dashboard" />} />
          <Route path="/my-participations" element={user && user.role === 'student' ? <MyParticipations /> : <Navigate to="/dashboard" />} />
          <Route path="/students" element={user && (user.role === 'admin' || user.role === 'faculty') ? <Students /> : <Navigate to="/dashboard" />} />
          <Route path="/participations" element={user && (user.role === 'admin' || user.role === 'faculty') ? <Participations /> : <Navigate to="/dashboard" />} />
          <Route path="/final-certificates" element={user && user.role === 'admin' ? <FinalCertificates /> : <Navigate to="/dashboard" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
