import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { FaCalendar, FaUsers, FaClock, FaTrophy, FaMapMarkerAlt } from 'react-icons/fa'

const Dashboard = () => {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [ongoingEvents, setOngoingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchEvents()
    // Refresh user data to get latest hours
    if (user?.role === 'student') {
      refreshUser()
    }
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/reports/dashboard-stats')
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const [upcoming, ongoing] = await Promise.all([
        axios.get('/events', { params: { status: 'upcoming' } }),
        axios.get('/events', { params: { status: 'ongoing' } })
      ])
      setUpcomingEvents(upcoming.data.slice(0, 3))
      setOngoingEvents(ongoing.data.slice(0, 3))
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="min-h-screen service-pattern dashboard-bg relative">

      
      {/* Hero Section with Service Theme */}
      <div className="hero-service py-16 mb-12 shadow-2xl relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center animate-fadeIn">
            <div className="mb-6">
              <span className="text-6xl animate-pulse">🤝</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
              Welcome, <span className="bg-gradient-to-r from-cyan-200 to-emerald-200 bg-clip-text text-transparent">{user?.name}!</span>
            </h1>
            <p className="text-2xl text-white/90 font-semibold mb-2">
              National Service Scheme
            </p>
            <p className="text-lg text-white/80 mb-4">
              Vignan University, Guntur
            </p>
            <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <p className="text-white font-bold text-lg">"Not Me, But You"</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-12 relative z-10">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="glass rounded-3xl p-6 hover:scale-105 transition-all duration-500 animate-slideIn">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">📅</span>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{stats?.totalEvents || 0}</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-blue-600 mb-1">Total Events</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalEvents || 0}</p>
        </div>
        <div className="glass rounded-3xl p-6 hover:scale-105 transition-all duration-500 animate-slideIn" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">👥</span>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{stats?.totalStudents || 0}</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-emerald-600 mb-1">Students</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalStudents || 0}</p>
        </div>
        <div className="glass rounded-3xl p-6 hover:scale-105 transition-all duration-500 animate-slideIn" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">🎯</span>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{stats?.totalParticipations || 0}</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-purple-600 mb-1">Participations</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalParticipations || 0}</p>
        </div>
        <div className="glass rounded-3xl p-6 hover:scale-105 transition-all duration-500 animate-slideIn" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">⏰</span>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{stats?.totalHours || 0}</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-orange-600 mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalHours || 0}</p>
        </div>
      </div>

      {user?.role === 'student' && (
        <div className="card mb-12 animate-scaleIn">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">🏆</span>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Your Impact</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
              <div className="text-5xl mb-3">⏰</div>
              <p className="text-gray-600 font-semibold mb-2">Total Hours Contributed</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">{user?.totalHours || 0}</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-1000" 
                  style={{width: `${Math.min((user?.totalHours || 0) / 60 * 100, 100)}%`}}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{Math.max(60 - (user?.totalHours || 0), 0)} hours to completion</p>
            </div>
            <div className="flex items-center justify-center">
              <Link to="/my-participations" className="btn-primary">
                <span className="mr-2">📋</span>
                View My Participations
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Events Section - Combined */}
      {(upcomingEvents.length > 0 || ongoingEvents.length > 0) && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold flex items-center animate-slideIn">
              <span className="text-5xl mr-4">📅</span>
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Active Events</span>
            </h2>
            <Link to="/events" className="btn-secondary flex items-center">
              <span className="mr-2">👀</span>
              View All Events
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ongoingEvents.map((event, index) => (
              <div 
                key={event._id} 
                onClick={() => navigate(`/events/${event._id}`)}
                className="relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer hover:shadow-blue-500/25 transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 bg-white/95 backdrop-blur-lg border border-white/20 animate-fadeIn"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-4 py-2 rounded-full text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-xl animate-pulse border border-white/30">
                    🔴 ONGOING
                  </span>
                </div>
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <FaCalendar className="text-6xl text-white opacity-50" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700">
                      <FaCalendar className="mr-2 text-orange-600" />
                      <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaMapMarkerAlt className="mr-2 text-orange-600" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaClock className="mr-2 text-orange-600" />
                      <span className="font-medium">{event.hours} hours</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {upcomingEvents.map(event => (
              <div 
                key={event._id} 
                onClick={() => navigate(`/events/${event._id}`)}
                className="relative overflow-hidden rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-2 bg-white"
              >
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-3 py-1 rounded-full text-xs bg-green-600 text-white font-bold shadow-lg">
                    UPCOMING
                  </span>
                </div>
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <FaCalendar className="text-6xl text-white opacity-50" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700">
                      <FaCalendar className="mr-2 text-green-600" />
                      <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaMapMarkerAlt className="mr-2 text-green-600" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaClock className="mr-2 text-green-600" />
                      <span className="font-medium">{event.hours} hours</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.topVolunteers && stats.topVolunteers.length > 0 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Top Volunteers</h2>
            <div className="space-y-3">
              {stats.topVolunteers.map((volunteer, index) => (
                <div key={volunteer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-primary">#{index + 1}</span>
                    <div>
                      <p className="font-semibold">{volunteer.name}</p>
                      <p className="text-sm text-gray-600">{volunteer.rollNumber} - {volunteer.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{volunteer.totalHours}</p>
                    <p className="text-sm text-gray-600">hours</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(user?.role === 'admin' || user?.role === 'faculty') && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-3xl mr-3">👥</span>
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Team Overview</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <FaTrophy className="text-2xl text-yellow-500" />
                  <span className="font-semibold">Coordinators</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{stats?.coordinators || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <FaUsers className="text-2xl text-blue-500" />
                  <span className="font-semibold">Core Team</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats?.coreTeam || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <FaUsers className="text-2xl text-green-500" />
                  <span className="font-semibold">Volunteers</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{stats?.volunteers || 0}</span>
              </div>
              {user?.role === 'admin' && (
                <Link to="/final-certificates" className="block">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏆</span>
                      <span className="font-semibold">Final Certificates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-purple-600">{stats?.eligibleForCertificate || 0}</span>
                      <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">Manage</span>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default Dashboard
