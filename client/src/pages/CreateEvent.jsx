import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { toast } from 'react-toastify'

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'tree-plantation',
    date: '', venue: '', hours: '', maxParticipants: ''
  })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => data.append(key, formData[key]))
      if (image) data.append('image', image)

      await axios.post('/events', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success('Event created successfully!')
      navigate('/events')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 nss-pattern">
      <div className="bg-gradient-to-r from-orange-600 via-white to-green-600 py-8 mb-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 text-center">Create New Event</h1>
          <p className="text-center text-gray-700 mt-2">Organize NSS Activities</p>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-8">
      <div className="max-w-2xl mx-auto">
        
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Event Title</label>
            <input type="text" className="input-field" value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea className="input-field" rows="4" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Category</label>
              <select className="input-field" value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="tree-plantation">Tree Plantation</option>
                <option value="blood-donation">Blood Donation</option>
                <option value="cleanliness">Cleanliness Drive</option>
                <option value="awareness">Awareness Campaign</option>
                <option value="workshop">Workshop</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Date</label>
              <input type="date" className="input-field" value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Venue</label>
              <input type="text" className="input-field" value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })} required />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Hours</label>
              <input type="number" className="input-field" value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })} required />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Max Participants (Optional)</label>
              <input type="number" className="input-field" value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Event Image</label>
              <input type="file" accept="image/*" className="input-field"
                onChange={(e) => setImage(e.target.files[0])} />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
      </div>
    </div>
  )
}

export default CreateEvent
