import { useState, useEffect } from 'react'
import axios from '../api/axios'
import { toast } from 'react-toastify'

const Participations = () => {
  const [participations, setParticipations] = useState([])
  const [filter, setFilter] = useState('attended')
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ pending: 0, attended: 0, approved: 0, rejected: 0 })

  useEffect(() => {
    fetchParticipations()
    fetchCounts()
  }, [filter])

  const fetchCounts = async () => {
    try {
      const statuses = ['pending', 'attended', 'approved', 'rejected']
      const countPromises = statuses.map(status => 
        axios.get('/participation', { params: { status } })
      )
      const results = await Promise.all(countPromises)
      setCounts({
        pending: results[0].data.length,
        attended: results[1].data.length,
        approved: results[2].data.length,
        rejected: results[3].data.length
      })
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }

  const fetchParticipations = async () => {
    try {
      const { data } = await axios.get('/participation', { params: { status: filter } })
      setParticipations(data)
    } catch (error) {
      toast.error('Error fetching participations')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id, hours, eventDate) => {
    if (!hours || hours <= 0) {
      toast.error('Please enter valid hours')
      return
    }

    // Check if event has been completed
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDateObj = new Date(eventDate)
    eventDateObj.setHours(0, 0, 0, 0)

    if (eventDateObj >= today) {
      toast.error('Cannot approve participation for future or ongoing events. Wait for event completion.')
      return
    }

    try {
      await axios.put(`/participation/approve/${id}`, {
        status: 'approved',
        hoursContributed: Number(hours)
      })
      toast.success('Participation approved! Certificate is now available for download.')
      fetchParticipations()
      fetchCounts()
    } catch (error) {
      console.error('Approve error:', error)
      toast.error(error.response?.data?.message || 'Error approving participation')
    }
  }

  const downloadCertificate = async (participationId, studentName) => {
    try {
      const response = await axios.get(`/reports/certificate/${participationId}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `NSS-Certificate-${studentName.replace(/\s+/g, '-')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Certificate downloaded successfully!')
    } catch (error) {
      toast.error('Error downloading certificate')
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this participation?')) {
      return
    }
    try {
      await axios.put(`/participation/approve/${id}`, { status: 'rejected' })
      toast.success('Participation rejected')
      fetchParticipations()
    } catch (error) {
      console.error('Reject error:', error)
      toast.error(error.response?.data?.message || 'Error rejecting participation')
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 nss-pattern">
      <div className="bg-gradient-to-r from-orange-600 via-white to-green-600 py-8 mb-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 text-center">Manage Participations</h1>
          <p className="text-center text-gray-700 mt-2">Review and Approve Student Reports</p>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button onClick={() => setFilter('pending')} 
            className={`px-4 py-2 rounded relative ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}>
            Pending
            {counts.pending > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {counts.pending}
              </span>
            )}
          </button>
          <button onClick={() => setFilter('attended')} 
            className={`px-4 py-2 rounded relative ${filter === 'attended' ? 'btn-primary' : 'btn-secondary'}`}>
            Attended
            {counts.attended > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                {counts.attended}
              </span>
            )}
          </button>
          <button onClick={() => setFilter('approved')} 
            className={`px-4 py-2 rounded relative ${filter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}>
            Approved
            {counts.approved > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {counts.approved}
              </span>
            )}
          </button>
          <button onClick={() => setFilter('rejected')} 
            className={`px-4 py-2 rounded relative ${filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
            Rejected
            {counts.rejected > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {counts.rejected}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {participations.map(participation => (
          <div key={participation._id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold">{participation.eventId?.title}</h3>
                <p className="text-gray-600 mb-2">
                  Student: {participation.studentId?.name} ({participation.studentId?.rollNumber})
                </p>
                <p className="text-gray-600 mb-2">
                  Department: {participation.studentId?.department}
                </p>
                
                {participation.reportText && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="font-semibold mb-1">Report:</p>
                    <p className="text-gray-700">{participation.reportText}</p>
                  </div>
                )}

                {participation.photos && participation.photos.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Photos:</p>
                    <div className="flex space-x-2">
                      {participation.photos.map((photo, index) => (
                        <img key={index} src={photo} alt={`Evidence ${index + 1}`} 
                          className="w-24 h-24 object-cover rounded" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4 min-w-[200px]">
                {/* Show status badge */}
                <div className="mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    participation.status === 'approved' ? 'bg-green-100 text-green-800' :
                    participation.status === 'attended' ? 'bg-blue-100 text-blue-800' :
                    participation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {participation.status.toUpperCase()}
                    {participation.status === 'approved' && ` - ${participation.hoursContributed}h`}
                  </span>
                </div>

                {/* Approve/Reject for Pending and Attended */}
                {(filter === 'pending' || filter === 'attended') && (
                  <>
                    <label className="text-sm font-semibold text-gray-700">Hours:</label>
                    <input 
                      type="number" 
                      placeholder="Hours" 
                      id={`hours-${participation._id}`}
                      className="input-field w-full" 
                      defaultValue={participation.eventId?.hours}
                      min="1"
                      max="24"
                    />
                    <button 
                      onClick={() => {
                        const hoursInput = document.getElementById(`hours-${participation._id}`)
                        const hours = hoursInput?.value
                        if (hours) {
                          handleApprove(participation._id, hours, participation.eventId?.date)
                        } else {
                          toast.error('Please enter hours')
                        }
                      }} 
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-semibold shadow-md hover:shadow-lg transition-all w-full"
                    >
                      ✓ Approve & Generate Certificate
                    </button>
                    <button 
                      onClick={() => handleReject(participation._id)} 
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold shadow-md hover:shadow-lg transition-all w-full"
                    >
                      ✗ Reject
                    </button>
                  </>
                )}

                {/* Certificate download for Approved */}
                {participation.status === 'approved' && (
                  <button
                    onClick={() => downloadCertificate(participation._id, participation.studentId?.name)}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center w-full"
                  >
                    📜 Download Certificate
                  </button>
                )}

                {/* Re-approve option for Rejected */}
                {filter === 'rejected' && (
                  <>
                    <label className="text-sm font-semibold text-gray-700">Hours:</label>
                    <input 
                      type="number" 
                      placeholder="Hours" 
                      id={`hours-${participation._id}`}
                      className="input-field w-full" 
                      defaultValue={participation.eventId?.hours}
                      min="1"
                      max="24"
                    />
                    <button 
                      onClick={() => {
                        const hoursInput = document.getElementById(`hours-${participation._id}`)
                        const hours = hoursInput?.value
                        if (hours) {
                          handleApprove(participation._id, hours)
                        } else {
                          toast.error('Please enter hours')
                        }
                      }} 
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-semibold shadow-md hover:shadow-lg transition-all w-full"
                    >
                      ✓ Re-Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {participations.length === 0 && (
        <div className="text-center py-12">
          <div className="card max-w-2xl mx-auto">
            <p className="text-gray-700 text-lg font-semibold mb-4">No {filter} participations found</p>
            <div className="text-left text-sm text-gray-600 space-y-2">
              <p><strong>Workflow:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li><strong>Pending:</strong> Students registered but event not completed yet</li>
                <li><strong>Attended:</strong> Students submitted reports - Ready for your approval!</li>
                <li><strong>Approved:</strong> You approved with hours - Certificate available</li>
                <li><strong>Rejected:</strong> Reports you rejected</li>
              </ol>
              <p className="mt-4 text-orange-600">
                💡 Tip: Students must submit participation reports after event completion. 
                Then they will appear in "Attended" tab for your approval.
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default Participations
