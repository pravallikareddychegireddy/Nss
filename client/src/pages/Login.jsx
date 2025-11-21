
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from '../api/axios'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.post('/auth/login', formData)
      login(data, data.token)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center service-pattern login-bg relative">

      <div className="card w-full max-w-md animate-scaleIn">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-white text-4xl font-bold">🤝</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-2">NSS Portal</h2>
          <p className="text-lg font-semibold text-gray-700">National Service Scheme</p>
          <p className="text-sm text-gray-500 mt-1">Vignan University, Guntur</p>
          <div className="mt-4 text-xs text-blue-600 font-medium">"Not Me, But You"</div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="w-full btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account? <Link to="/register" className="text-primary font-semibold">Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
