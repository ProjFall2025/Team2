import { useState } from 'react'
import { useAuth } from '../context/useAuth'

interface SignUpProps {
  onSwitchToLogin: () => void
}

export function SignUp({ onSwitchToLogin }: SignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, {
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
      })

      setSuccess(true)
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFirstName('')
      setMiddleName('')
      setLastName('')
      setPhoneNumber('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Snowflake decorations */}
      <div className="absolute top-10 left-10 text-4xl text-blue-200 opacity-60 animate-pulse">❄️</div>
      <div className="absolute top-20 right-20 text-5xl text-cyan-200 opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}>❄️</div>
      <div className="absolute bottom-20 left-1/4 text-3xl text-blue-100 opacity-40 animate-pulse" style={{ animationDelay: '1s' }}>❄️</div>
      <div className="absolute bottom-10 right-1/3 text-4xl text-cyan-100 opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}>❄️</div>
      <div className="absolute top-1/3 right-10 text-3xl text-blue-200 opacity-45 animate-pulse" style={{ animationDelay: '0.7s' }}>❄️</div>

      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm border border-blue-100 relative z-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 text-center">❄️ Winter Sign Up</h1>
        <p className="text-center text-gray-600 mb-6 text-sm">Join our winter event community</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-cyan-50 border-l-4 border-cyan-500 text-cyan-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
            <span className="text-xl">✨</span>
            <span>Account created! Check your email to confirm your account.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200 shadow-md">
            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              <span>👤</span> Personal Information
            </h3>

            <div className="space-y-5">
              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition">
                <label className="block text-blue-900 font-semibold mb-3 text-sm">📧 Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white shadow-sm hover:shadow-md transition"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition">
                  <label className="block text-blue-900 font-semibold mb-3 text-sm">❄️ First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white shadow-sm hover:shadow-md transition"
                    placeholder="John"
                  />
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition">
                  <label className="block text-blue-900 font-semibold mb-3 text-sm">❄️ Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white shadow-sm hover:shadow-md transition"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition">
                <label className="block text-blue-900 font-semibold mb-3 text-sm">❄️ Middle Name</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white shadow-sm hover:shadow-md transition"
                  placeholder="Michael (optional)"
                />
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition">
                <label className="block text-blue-900 font-semibold mb-3 text-sm">📱 Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white shadow-sm hover:shadow-md transition"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border-2 border-cyan-200 shadow-md">
            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              <span>🔐</span> Security
            </h3>

            <div className="space-y-5">
              <div className="bg-white rounded-lg p-4 border border-cyan-100 shadow-sm hover:shadow-md transition">
                <label className="block text-blue-900 font-semibold mb-3 text-sm">🔐 Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white shadow-sm hover:shadow-md transition"
                  placeholder="••••••••"
                />
              </div>

              <div className="bg-white rounded-lg p-4 border border-cyan-100 shadow-sm hover:shadow-md transition">
                <label className="block text-blue-900 font-semibold mb-3 text-sm">🔐 Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white shadow-sm hover:shadow-md transition"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition duration-300 shadow-lg hover:shadow-2xl disabled:shadow-md transform hover:scale-105 disabled:scale-100 text-lg flex items-center justify-center gap-2 border-2 border-blue-500 hover:border-cyan-400"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>❄️</span>
                  <span>Sign Up</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-blue-200">
          <p className="text-center text-blue-900 mb-4">
            Already have an account?
          </p>
          <button
            onClick={onSwitchToLogin}
            className="w-full bg-gradient-to-r from-slate-200 to-blue-200 hover:from-slate-300 hover:to-blue-300 text-blue-900 font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>🔑</span>
            <span>Login here</span>
          </button>
        </div>
      </div>
    </div>
  )
}

