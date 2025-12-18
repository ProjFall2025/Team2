import { useState } from 'react'
import { useAuth } from '../context/useAuth'

interface LoginProps {
  onSwitchToSignUp: () => void
}

export function Login({ onSwitchToSignUp }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Snowflake decorations */}

      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm border border-blue-100 relative z-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 text-center">❄️ Winter Login</h1>
        <p className="text-center text-gray-600 mb-6 text-sm">Welcome back to our winter event community</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Login Credentials Section */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200 shadow-md">
            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              <span>🔐</span> Login Credentials
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

              <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition">
                <label className="block text-blue-900 font-semibold mb-3 text-sm">🔐 Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white shadow-sm hover:shadow-md transition"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>❄️</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-blue-200">
          <p className="text-center text-blue-900 mb-4">
            Don't have an account?
          </p>
          <button
            onClick={onSwitchToSignUp}
            className="w-full bg-gradient-to-r from-slate-200 to-blue-200 hover:from-slate-300 hover:to-blue-300 text-blue-900 font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>✍️</span>
            <span>Sign Up here</span>
          </button>
        </div>
      </div>
    </div>
  )
}

