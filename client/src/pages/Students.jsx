import { useState, useEffect } from 'react'
import axios from '../api/axios'
import { toast } from 'react-toastify'
import { FaTrophy, FaEnvelope, FaPhone, FaStar, FaUsers, FaCrown } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const Students = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [teamRole, setTeamRole] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [filter])

  const fetchStudents = async () => {
    try {
      const params = filter !== 'all' ? { teamRole: filter } : {}
      const { data } = await axios.get('/users/students', { params })
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTeamRole = async (studentId, newRole) => {
    try {
      await axios.put(`/users/${studentId}/team-role`, { teamRole: newRole })
      toast.success('Team role updated successfully!')
      setEditingId(null)
      fetchStudents()
    } catch (error) {
      toast.error('Failed to update team role')
    }
  }

  const getTeamRoleIcon = (role) => {
    switch(role) {
      case 'coordinator': return <FaCrown className="text-yellow-500" />
      case 'core-team': return <FaStar className="text-blue-500" />
      case 'volunteer': return <FaUsers className="text-green-500" />
      default: return null
    }
  }

  const getTeamRoleBadge = (role) => {
    if (!role) return null
    const colors = {
      'coordinator': 'bg-yellow-100 text-yellow-800',
      'core-team': 'bg-blue-100 text-blue-800',
      'volunteer': 'bg-green-100 text-green-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[role]}`}>
        {role.replace('-', ' ').toUpperCase()}
      </span>
    )
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 nss-pattern">
      <div className="bg-gradient-to-r from-orange-600 via-white to-green-600 py-8 mb-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 text-center">NSS Volunteers</h1>
          <p className="text-center text-gray-700 mt-2">Our Dedicated Team Members</p>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button onClick={() => setFilter('all')} 
            className={`px-4 py-2 rounded ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>
            All
          </button>
          <button onClick={() => setFilter('coordinator')} 
            className={`px-4 py-2 rounded ${filter === 'coordinator' ? 'btn-primary' : 'btn-secondary'}`}>
            Coordinators
          </button>
          <button onClick={() => setFilter('core-team')} 
            className={`px-4 py-2 rounded ${filter === 'core-team' ? 'btn-primary' : 'btn-secondary'}`}>
            Core Team
          </button>
          <button onClick={() => setFilter('volunteer')} 
            className={`px-4 py-2 rounded ${filter === 'volunteer' ? 'btn-primary' : 'btn-secondary'}`}>
            Volunteers
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map(student => (
          <div key={student._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getTeamRoleIcon(student.teamRole)}
                <div>
                  <h3 className="text-xl font-bold">{student.name}</h3>
                  {student.rollNumber && <p className="text-gray-600">{student.rollNumber}</p>}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600">
                  <FaTrophy className="mr-1" />
                  <span className="font-bold">{student.totalHours}h</span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              {getTeamRoleBadge(student.teamRole)}
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p><strong>Department:</strong> {student.department}</p>
              {student.year && <p><strong>Year:</strong> {student.year}</p>}
              
              {student.email && (
                <div className="flex items-center">
                  <FaEnvelope className="mr-2" />
                  <span className="truncate">{student.email}</span>
                </div>
              )}
              
              {student.phone && (
                <div className="flex items-center">
                  <FaPhone className="mr-2" />
                  <span>{student.phone}</span>
                </div>
              )}
            </div>

            {user?.role === 'admin' && (
              <div className="border-t pt-3">
                {editingId === student._id ? (
                  <div className="space-y-2">
                    <select 
                      className="input-field text-sm"
                      value={teamRole}
                      onChange={(e) => setTeamRole(e.target.value)}
                    >
                      <option value="">No Role</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="core-team">Core Team</option>
                      <option value="volunteer">Volunteer</option>
                    </select>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => updateTeamRole(student._id, teamRole)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setEditingId(student._id)
                      setTeamRole(student.teamRole || '')
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    Assign Team Role
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No students found</p>
        </div>
      )}
      </div>
    </div>
  )
}

export default Students
