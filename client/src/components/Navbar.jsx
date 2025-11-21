import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaHome, FaCalendar, FaUsers, FaUser, FaSignOutAlt, FaPlus, FaClipboardList } from 'react-icons/fa'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar-service text-white shadow-2xl relative z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-5">
          <Link to="/dashboard" className="text-3xl font-bold flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
            <span className="text-4xl">🤝</span>
            <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">NSS Portal</span>
          </Link>

          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2 hover:text-cyan-200 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-lg hover:bg-white/10">
              <FaHome className="text-lg" /> <span className="font-semibold">Dashboard</span>
            </Link>
            
            <Link to="/events" className="flex items-center space-x-2 hover:text-cyan-200 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-lg hover:bg-white/10">
              <FaCalendar className="text-lg" /> <span className="font-semibold">Events</span>
            </Link>

            {(user?.role === 'admin' || user?.role === 'faculty') && (
              <>
                <Link to="/create-event" className="flex items-center space-x-2 hover:text-cyan-200 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-lg hover:bg-white/10">
                  <FaPlus className="text-lg" /> <span className="font-semibold">Create Event</span>
                </Link>
                <Link to="/students" className="flex items-center space-x-2 hover:text-cyan-200 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-lg hover:bg-white/10">
                  <FaUsers className="text-lg" /> <span className="font-semibold">Students</span>
                </Link>
                <Link to="/participations" className="flex items-center space-x-2 hover:text-cyan-200 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-lg hover:bg-white/10">
                  <FaClipboardList className="text-lg" /> <span className="font-semibold">Participations</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/final-certificates" className="flex items-center space-x-2 hover:text-yellow-200 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-lg hover:bg-white/10 border border-yellow-400/30">
                    <span className="text-lg">🏆</span> <span className="font-semibold">Final Certificates</span>
                  </Link>
                )}
              </>
            )}

            {user?.role === 'student' && (
              <Link to="/my-participations" className="flex items-center space-x-2 hover:text-cyan-200 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-lg hover:bg-white/10">
                <FaClipboardList className="text-lg" /> <span className="font-semibold">My Participations</span>
              </Link>
            )}

            <Link to="/profile" className="flex items-center space-x-3 hover:text-cyan-200 transition-all duration-300 hover:scale-110 px-4 py-2 rounded-lg hover:bg-white/10 bg-white/5">
              <FaUser className="text-lg" /> 
              <span className="font-semibold">{user?.name}</span>
              <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">{user?.role}</span>
            </Link>

            <button onClick={handleLogout} className="flex items-center space-x-2 hover:text-red-300 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-lg hover:bg-red-500/10 border border-red-400/30">
              <FaSignOutAlt className="text-lg" /> <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
