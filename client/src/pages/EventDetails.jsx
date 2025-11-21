import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { FaCalendar, FaMapMarkerAlt, FaClock, FaUser } from 'react-icons/fa'

const EventDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const { data } = await axios.get(`/events/${id}`)
      setEvent(data)
    } catch (error) {
      toast.error('Error fetching event details')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setRegistering(true)
    try {
      await axios.post('/participation/register', { eventId: id })
      toast.success('Successfully registered for the event!')
      fetchEvent()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  const handleMarkAttended = async () => {
    setRegistering(true)
    try {
      await axios.post('/participation/mark-attended', { eventId: id })
      toast.success('Marked as attended! You can now submit your report.')
      navigate('/my-participations')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance')
    } finally {
      setRegistering(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      try {
        await axios.delete(`/participation/cancel/${id}`)
        toast.success('Registration cancelled successfully')
        fetchEvent()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel registration')
      }
    }
  }

  const downloadAttendanceList = async () => {
    try {
      const response = await axios.get(`/reports/attendance-list/${id}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance-${event.title}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Attendance list downloaded!')
    } catch (error) {
      toast.error('Failed to download attendance list')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/events/${id}`)
        toast.success('Event deleted successfully')
        navigate('/events')
      } catch (error) {
        toast.error('Error deleting event')
      }
    }
  }

  const isEventPast = () => {
    const eventDate = new Date(event.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return eventDate < today
  }

  const canRegister = () => {
    return user?.role === 'student' && (event.status === 'upcoming' || event.status === 'ongoing') && !isEventPast()
  }

  const canMarkAttended = () => {
    return user?.role === 'student' && isEventPast() && event.status === 'completed'
  }

  const [userParticipation, setUserParticipation] = useState(null)

  useEffect(() => {
    if (user?.role === 'student' && event) {
      checkParticipation()
    }
  }, [event, user])

  const checkParticipation = async () => {
    try {
      const { data } = await axios.get(`/participation/check/${id}`)
      setUserParticipation(data)
    } catch (error) {
      setUserParticipation(null)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>
  if (!event) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Event not found</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 nss-pattern">
      <div className="bg-gradient-to-r from-orange-600 via-white to-green-600 py-8 mb-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 text-center">Event Details</h1>
          <p className="text-center text-gray-700 mt-2">NSS Activity Information</p>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          {event.image && (
            <img src={event.image} alt={event.title} className="w-full h-64 object-cover rounded-lg mb-6" />
          )}

          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <FaCalendar className="mr-2" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaMapMarkerAlt className="mr-2" />
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaClock className="mr-2" />
              <span>{event.hours} hours</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaUser className="mr-2" />
              <span>{event.coordinatorId?.name}</span>
            </div>
          </div>

          <div className="mb-6">
            <span className={`px-3 py-1 rounded-full text-sm ${
              event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
              event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {event.status}
            </span>
            <span className="ml-2 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              {event.category}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Description</h2>
            <p className="text-gray-700">{event.description}</p>
          </div>

          <div className="flex flex-col space-y-4">
            {user?.role === 'student' && (
              <>
                {userParticipation ? (
                  <div className="space-y-2">
                    <div className={`px-4 py-3 rounded-lg ${
                      userParticipation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      userParticipation.status === 'attended' ? 'bg-blue-100 text-blue-800' :
                      userParticipation.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <p className="font-semibold">Registration Status: {userParticipation.status.toUpperCase()}</p>
                      {userParticipation.status === 'pending' && !isEventPast() && (
                        <p className="text-sm">You are registered for this event</p>
                      )}
                    </div>
                    {userParticipation.status === 'pending' && !isEventPast() && (
                      <button onClick={handleCancelRegistration} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full">
                        Cancel Registration
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {canRegister() ? (
                      <button onClick={handleRegister} className="btn-primary" disabled={registering}>
                        {registering ? 'Registering...' : 'Register for Event'}
                      </button>
                    ) : canMarkAttended() ? (
                      <div className="space-y-2">
                        <div className="bg-blue-100 text-blue-700 px-4 py-3 rounded-lg">
                          <p className="font-semibold">Did you attend this event?</p>
                          <p className="text-sm">Mark your attendance to submit participation report</p>
                        </div>
                        <button onClick={handleMarkAttended} className="btn-primary w-full" disabled={registering}>
                          {registering ? 'Processing...' : 'Yes, I Attended This Event'}
                        </button>
                      </div>
                    ) : isEventPast() ? (
                      <div className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg">
                        <p className="font-semibold">This event has ended</p>
                        <p className="text-sm">Registration is no longer available</p>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            )}

            {(user?.role === 'admin' || user?.role === 'faculty') && (
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-4">
                  <button onClick={() => navigate(`/events/${id}/edit`)} className="btn-secondary">
                    Edit Event
                  </button>
                  <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Delete Event
                  </button>
                </div>
                <button onClick={downloadAttendanceList} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Download Attendance List (PDF)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default EventDetails
