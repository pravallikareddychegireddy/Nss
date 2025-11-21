import { useState, useEffect } from 'react'
import axios from '../api/axios'
import { toast } from 'react-toastify'
import { FaCalendar, FaMapMarkerAlt, FaClock, FaDownload } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const MyParticipations = () => {
  const { refreshUser } = useAuth()
  const [participations, setParticipations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedParticipation, setSelectedParticipation] = useState(null)
  const [reportData, setReportData] = useState({ reportText: '', feedback: '' })
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    fetchParticipations()
    // Refresh user data to get latest hours
    refreshUser()
  }, [])

  const fetchParticipations = async () => {
    try {
      const { data } = await axios.get('/participation/my-participations')
      setParticipations(data)
    } catch (error) {
      toast.error('Error fetching participations')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReport = async (participationId) => {
    try {
      const formData = new FormData()
      formData.append('reportText', reportData.reportText)
      formData.append('feedback', reportData.feedback)
      photos.forEach(photo => formData.append('photos', photo))

      await axios.post(`/participation/submit-report/${participationId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Report submitted successfully!')
      setSelectedParticipation(null)
      setReportData({ reportText: '', feedback: '' })
      setPhotos([])
      fetchParticipations()
    } catch (error) {
      toast.error('Error submitting report')
    }
  }

  const downloadCertificate = async (participationId) => {
    try {
      const response = await axios.get(`/reports/certificate/${participationId}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `certificate-${participationId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast.error('Error downloading certificate')
    }
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 nss-pattern">
      <div className="bg-gradient-to-r from-orange-600 via-white to-green-600 py-8 mb-8 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 text-center">My Participations</h1>
          <p className="text-center text-gray-700 mt-2">Track Your NSS Journey</p>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-8">

      <div className="space-y-4">
        {participations.map(participation => (
          <div key={participation._id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{participation.eventId?.title}</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <FaCalendar className="mr-2" />
                    <span>{new Date(participation.eventId?.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{participation.eventId?.venue}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaClock className="mr-2" />
                    <span>{participation.hoursContributed || 0} hours</span>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-sm ${
                  participation.status === 'approved' ? 'bg-green-100 text-green-800' :
                  participation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  participation.status === 'attended' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {participation.status}
                </span>
              </div>

              <div className="flex flex-col space-y-2">
                {participation.status === 'pending' && (
                  <>
                    {participation.eventId?.status === 'completed' || new Date(participation.eventId?.date) < new Date() ? (
                      <button onClick={() => setSelectedParticipation(participation._id)} className="btn-primary">
                        Submit Report
                      </button>
                    ) : (
                      <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm text-center">
                        Wait for event to complete
                      </div>
                    )}
                  </>
                )}
                
                {participation.status === 'attended' && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded text-sm text-center">
                    Report submitted - Awaiting approval
                  </div>
                )}
                
                {participation.status === 'approved' && (
                  <div className="space-y-2">
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm text-center font-semibold">
                      ✓ Approved - {participation.hoursContributed}h
                    </div>
                    <button onClick={() => downloadCertificate(participation._id)} 
                      className="btn-primary flex items-center justify-center w-full shadow-lg hover:shadow-xl">
                      <FaDownload className="mr-2" /> Download Certificate
                    </button>
                  </div>
                )}

                {participation.status === 'rejected' && (
                  <div className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm text-center">
                    Report rejected
                  </div>
                )}
              </div>
            </div>

            {selectedParticipation === participation._id && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h4 className="font-bold mb-2">Submit Participation Report</h4>
                <textarea className="input-field mb-2" rows="4" placeholder="Describe your experience..."
                  value={reportData.reportText}
                  onChange={(e) => setReportData({ ...reportData, reportText: e.target.value })} />
                
                <textarea className="input-field mb-2" rows="2" placeholder="Feedback (optional)"
                  value={reportData.feedback}
                  onChange={(e) => setReportData({ ...reportData, feedback: e.target.value })} />
                
                <input type="file" accept="image/*" multiple className="input-field mb-2"
                  onChange={(e) => setPhotos(Array.from(e.target.files))} />
                
                <div className="flex space-x-2">
                  <button onClick={() => handleSubmitReport(participation._id)} className="btn-primary">
                    Submit
                  </button>
                  <button onClick={() => setSelectedParticipation(null)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {participations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No participations yet</p>
        </div>
      )}
      </div>
    </div>
  )
}

export default MyParticipations
