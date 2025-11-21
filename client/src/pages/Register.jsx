import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from '../api/axios'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student',
    rollNumber: '', department: '', year: '', phone: ''
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [sentCode, setSentCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const navigate = useNavigate()

  const sendVerificationCode = async () => {
    if (!formData.email) {
      toast.error('Please enter your email first')
      return
    }

    setSendingCode(true)
    try {
      const { data } = await axios.post('/auth/send-verification', { email: formData.email })
      setSentCode(data.code) // In production, this won't be sent
      setCodeSent(true)
      toast.success('Verification code sent to your email!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code')
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!codeSent) {
      toast.error('Please verify your email first by clicking the Verify button')
      return
    }

    if (verificationCode !== sentCode) {
      toast.error('Invalid verification code. Please check your email.')
      return
    }

    setLoading(true)

    try {
      await axios.post('/auth/register', { ...formData, verificationCode })
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center service-pattern login-bg py-8 relative">

      <div className="card w-full max-w-2xl animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-white text-4xl font-bold">🌟</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-2">Join NSS Portal</h2>
          <p className="text-lg font-semibold text-gray-700">National Service Scheme</p>
          <p className="text-sm text-gray-500 mt-1">Vignan University, Guntur</p>
          <div className="mt-4 text-xs text-blue-600 font-medium">"Be the Change You Want to See"</div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input type="text" className="input-field" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <div className="flex space-x-2">
                <input type="email" className="input-field flex-1" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={sendingCode || codeSent}
                  className={`px-4 py-2 rounded font-semibold ${
                    codeSent ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {sendingCode ? 'Sending...' : codeSent ? '✓ Sent' : 'Verify'}
                </button>
              </div>
            </div>

            {codeSent && (
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">Verification Code *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter 6-digit code from email"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength="6"
                  required
                />
                <p className="text-sm text-green-600 mt-1">
                  ✓ Verification code sent! Check your email inbox (or spam folder)
                </p>
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input type="password" className="input-field" value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Role</label>
              <select className="input-field" value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <>
                <div>
                  <label className="block text-gray-700 mb-2">Roll Number</label>
                  <input type="text" className="input-field" value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} />
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
              </>
            )}

            <div>
              <label className="block text-gray-700 mb-2">Department</label>
              <input type="text" className="input-field" value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Phone</label>
              <input type="tel" className="input-field" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account? <Link to="/login" className="text-primary font-semibold">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
