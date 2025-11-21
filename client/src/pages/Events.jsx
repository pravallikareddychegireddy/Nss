import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from '../api/axios'
import { FaCalendar, FaMapMarkerAlt, FaClock } from 'react-icons/fa'

const Events = () => {
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [filter])

  const fetchEvents = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const { data } = await axios.get('/events', { params })
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 nss-pattern">
      <div className="bg-gradient-to-r from-orange-600 via-white to-green-600 py-8 mb-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 text-center">NSS Events</h1>
          <p className="text-center text-gray-700 mt-2">Vignan University - National Service Scheme</p>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button onClick={() => setFilter('all')} 
            className={`px-4 py-2 rounded ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>
            All
          </button>
          <button onClick={() => setFilter('upcoming')} 
            className={`px-4 py-2 rounded ${filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}>
            Upcoming
          </button>
          <button onClick={() => setFilter('completed')} 
            className={`px-4 py-2 rounded ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}>
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <Link key={event._id} to={`/events/${event._id}`} className="card hover:shadow-xl transition">
            {event.image && (
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover rounded-t-lg mb-4" />
            )}
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
            
            <div className="space-y-2">
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
            </div>
            
            <div className="mt-4">
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
          </Link>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No events found</p>
        </div>
      )}
      </div>
    </div>
  )
}

export default Events
