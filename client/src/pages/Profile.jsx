import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from '../api/axios'
import { toast } from 'react-toastify'
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaTrophy } from 'react-icons/fa'

const Profile = () => {
  const { user, refreshUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '', phone: '', department: '', year: ''
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        department: user.department || '',
        year: user.year || ''
      })
    }
    // Refresh user data when profile loads
    if (user?.role === 'student') {
      refreshUser()
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.put('/users/profile', formData)
      toast.success('Profile updated successfully!')
      
      // Update local storage
      const updatedUser = { ...user, ...data }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      setEditing(false)
    } catch (error) {
      toast.error('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 nss-pattern">
      <div className="bg-gradient-to-r from-orange-600 via-white to-green-600 py-8 mb-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 text-center">My Profile</h1>
          <p className="text-center text-gray-700 mt-2">Manage Your Information</p>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-8">
      <div className="max-w-3xl mx-auto">

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-gray-600">{user?.role}</p>
              </div>
            </div>
            <button onClick={() => setEditing(!editing)} className="btn-secondary">
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input type="text" className="input-field" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input type="tel" className="input-field" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Department</label>
                <input type="text" className="input-field" value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Year</label>
                <select className="input-field" value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}>
                  <option value="">Select Year</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <FaEnvelope className="text-xl text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
              </div>

              {user?.rollNumber && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <FaUser className="text-xl text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="font-semibold">{user.rollNumber}</p>
                  </div>
                </div>
              )}

              {user?.phone && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <FaPhone className="text-xl text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold">{user.phone}</p>
                  </div>
                </div>
              )}

              {user?.department && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <FaGraduationCap className="text-xl text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-semibold">{user.department}</p>
                  </div>
                </div>
              )}

              {user?.year && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <FaGraduationCap className="text-xl text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-semibold">Year {user.year}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {user?.role === 'student' && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaTrophy className="text-5xl text-yellow-500" />
                <div>
                  <p className="text-gray-600">Total Hours Contributed</p>
                  <p className="text-4xl font-bold text-green-600">{user?.totalHours || 0} / 60</p>
                  {user?.totalHours >= 60 ? (
                    <p className="text-sm text-green-600 font-semibold mt-1">✓ Year Completion Achieved!</p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">{60 - (user?.totalHours || 0)} hours remaining</p>
                  )}
                </div>
              </div>
              {user?.totalHours >= 60 && (
                <button
                  onClick={async () => {
                    try {
                      const response = await axios.get(`/reports/year-completion-certificate/${user._id}`, {
                        responseType: 'blob'
                      })
                      const url = window.URL.createObjectURL(new Blob([response.data]))
                      const link = document.createElement('a')
                      link.href = url
                      link.setAttribute('download', `NSS-Year-Completion-${user.rollNumber}.pdf`)
                      document.body.appendChild(link)
                      link.click()
                      link.remove()
                      toast.success('Year Completion Certificate downloaded!')
                    } catch (error) {
                      toast.error('Error downloading certificate')
                    }
                  }}
                  className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  📜 Download Year Completion Certificate
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default Profile

