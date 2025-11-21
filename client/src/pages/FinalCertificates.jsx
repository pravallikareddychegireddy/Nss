import { useState, useEffect } from 'react'
import axios from '../api/axios'
import { toast } from 'react-toastify'
import { FaTrophy, FaDownload, FaStar, FaCheck, FaHourglassHalf } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const FinalCertificates = () => {
  const { user } = useAuth()
  const [eligibleStudents, setEligibleStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [certificateData, setCertificateData] = useState({
    performanceRating: 'good',
    adminRemarks: ''
  })

  useEffect(() => {
    fetchEligibleStudents()
  }, [])

  const fetchEligibleStudents = async () => {
    try {
      const { data } = await axios.get('/reports/eligible-students')
      setEligibleStudents(data)
    } catch (error) {
      toast.error('Error fetching eligible students')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkEligible = async (studentId) => {
    try {
      await axios.put(`/reports/mark-eligible/${studentId}`, certificateData)
      toast.success('Student marked as eligible for final certificate!')
      setShowModal(false)
      setSelectedStudent(null)
      setCertificateData({ performanceRating: 'good', adminRemarks: '' })
      fetchEligibleStudents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error marking student as eligible')
    }
  }

  const downloadFinalCertificate = async (studentId, studentName) => {
    try {
      const response = await axios.get(`/reports/final-certificate/${studentId}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `NSS-Final-Certificate-${studentName.replace(/\s+/g, '-')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Final certificate downloaded successfully!')
      fetchEligibleStudents() // Refresh to update status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error downloading certificate')
    }
  }

  const openEligibilityModal = (student) => {
    setSelectedStudent(student)
    setShowModal(true)
  }

  const getRatingColor = (rating) => {
    switch(rating) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'satisfactory': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRatingIcon = (rating) => {
    switch(rating) {
      case 'excellent': return '🏆'
      case 'good': return '⭐'
      case 'satisfactory': return '👍'
      default: return '📋'
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen service-pattern flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p>Only administrators can manage final certificates.</p>
        </div>
      </div>
    )
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="min-h-screen service-pattern participations-bg relative">

      {/* Hero Section */}
      <div className="hero-service py-16 mb-12 shadow-2xl relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center animate-fadeIn">
            <div className="mb-6">
              <span className="text-6xl animate-pulse">🏆</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
              Final <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">Certificates</span>
            </h1>
            <p className="text-2xl text-white/90 font-semibold mb-2">
              NSS Completion Certificate Management
            </p>
            <p className="text-lg text-white/80 mb-4">
              Recognize Outstanding Student Achievements
            </p>
            <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <p className="text-white font-bold text-lg">"Excellence in Service"</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-12 relative z-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass rounded-3xl p-6 text-center animate-slideIn">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Eligible Students</h3>
            <p className="text-3xl font-bold text-blue-600">{eligibleStudents.filter(s => !s.finalCertificateGenerated).length}</p>
          </div>
          <div className="glass rounded-3xl p-6 text-center animate-slideIn" style={{animationDelay: '0.1s'}}>
            <div className="text-4xl mb-3">📜</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Certificates Generated</h3>
            <p className="text-3xl font-bold text-green-600">{eligibleStudents.filter(s => s.finalCertificateGenerated).length}</p>
          </div>
          <div className="glass rounded-3xl p-6 text-center animate-slideIn" style={{animationDelay: '0.2s'}}>
            <div className="text-4xl mb-3">⏰</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Hours</h3>
            <p className="text-3xl font-bold text-purple-600">{eligibleStudents.reduce((sum, s) => sum + s.totalHours, 0)}</p>
          </div>
        </div>

        {/* Students List */}
        <div className="card animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold flex items-center">
              <span className="text-4xl mr-4">🎓</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Students (60+ Hours Completed)
              </span>
            </h2>
          </div>

          {eligibleStudents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Eligible Students Yet</h3>
              <p className="text-gray-500">Students will appear here once they complete 60+ hours of service.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {eligibleStudents.map((student, index) => (
                <div key={student._id} className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 animate-slideIn" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                          <p className="text-gray-600">{student.rollNumber} • {student.department}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl mb-1">⏰</div>
                          <p className="text-sm text-gray-600">Total Hours</p>
                          <p className="text-lg font-bold text-blue-600">{student.totalHours}</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl mb-1">📧</div>
                          <p className="text-sm text-gray-600">Contact</p>
                          <p className="text-xs text-gray-700">{student.email}</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl mb-1">📅</div>
                          <p className="text-sm text-gray-600">Year</p>
                          <p className="text-lg font-bold text-purple-600">{student.year || 'N/A'}</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="text-2xl mb-1">🏆</div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="text-xs font-semibold">
                            {student.finalCertificateGenerated ? (
                              <span className="text-green-600">✅ Completed</span>
                            ) : student.isEligibleForFinalCertificate ? (
                              <span className="text-blue-600">📋 Eligible</span>
                            ) : (
                              <span className="text-orange-600">⏳ Pending</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {student.performanceRating && (
                        <div className="mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(student.performanceRating)}`}>
                            <span className="mr-2">{getRatingIcon(student.performanceRating)}</span>
                            Performance: {student.performanceRating.charAt(0).toUpperCase() + student.performanceRating.slice(1)}
                          </span>
                        </div>
                      )}

                      {student.adminRemarks && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 font-semibold mb-1">Admin Remarks:</p>
                          <p className="text-sm text-gray-700">{student.adminRemarks}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-3 lg:ml-6 mt-4 lg:mt-0">
                      {!student.finalCertificateGenerated ? (
                        <>
                          {!student.isEligibleForFinalCertificate ? (
                            <button
                              onClick={() => openEligibilityModal(student)}
                              className="btn-primary flex items-center justify-center"
                            >
                              <FaCheck className="mr-2" />
                              Mark Eligible
                            </button>
                          ) : (
                            <button
                              onClick={() => downloadFinalCertificate(student._id, student.name)}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-xl hover:shadow-green-500/25 transform hover:-translate-y-1 font-semibold flex items-center justify-center"
                            >
                              <FaDownload className="mr-2" />
                              Generate Certificate
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                          <div className="text-3xl mb-2">✅</div>
                          <p className="text-sm font-semibold text-green-600">Certificate Generated</p>
                          <p className="text-xs text-gray-500">
                            {new Date(student.finalCertificateGeneratedAt).toLocaleDateString()}
                          </p>
                          <button
                            onClick={() => downloadFinalCertificate(student._id, student.name)}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center justify-center"
                          >
                            <FaDownload className="mr-1" />
                            Re-download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Eligibility Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 animate-scaleIn">
            <h3 className="text-2xl font-bold mb-6 text-center">
              <span className="text-3xl mr-3">🏆</span>
              Mark Student Eligible
            </h3>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-800">{selectedStudent.name}</h4>
              <p className="text-blue-600 text-sm">{selectedStudent.rollNumber} • {selectedStudent.totalHours} hours</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Performance Rating</label>
                <select
                  className="input-field"
                  value={certificateData.performanceRating}
                  onChange={(e) => setCertificateData({...certificateData, performanceRating: e.target.value})}
                >
                  <option value="excellent">🏆 Excellent</option>
                  <option value="good">⭐ Good</option>
                  <option value="satisfactory">👍 Satisfactory</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Admin Remarks (Optional)</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Add any special remarks about the student's performance..."
                  value={certificateData.adminRemarks}
                  onChange={(e) => setCertificateData({...certificateData, adminRemarks: e.target.value})}
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkEligible(selectedStudent._id)}
                className="flex-1 btn-primary"
              >
                Mark Eligible
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinalCertificates