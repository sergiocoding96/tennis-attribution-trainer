import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, Loader2, LogIn, UserPlus, AlertCircle } from 'lucide-react'

export default function Auth({ onClose }) {
  const { isDark } = useTheme()
  const { signIn, signUp, error: authError } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Check your email to confirm your account!')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          onClose?.()
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md rounded-2xl p-6 animate-fade-in ${
        isDark ? 'bg-dark-card border border-dark-border' : 'bg-white shadow-xl'
      }`}>
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold ${
            isDark ? 'text-dark-text' : 'text-light-text'
          }`}>
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className={`mt-1 text-sm ${
            isDark ? 'text-dark-muted' : 'text-light-muted'
          }`}>
            {mode === 'signin' 
              ? 'Sign in to track your progress' 
              : 'Start your mental game journey'
            }
          </p>
        </div>

        {/* Error/Success Messages */}
        {(error || authError) && (
          <div className="mb-4 p-3 rounded-lg bg-score-negative/10 border border-score-negative/20 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-score-negative flex-shrink-0 mt-0.5" />
            <p className="text-sm text-score-negative">{error || authError}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-score-positive/10 border border-score-positive/20">
            <p className="text-sm text-score-positive">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${
                isDark ? 'text-dark-muted' : 'text-light-muted'
              }`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-dark-muted' : 'text-light-muted'
                }`} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`input-field pl-10 ${
                    isDark ? 'input-dark' : 'input-light'
                  }`}
                  placeholder="Your name"
                  required={mode === 'signup'}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${
              isDark ? 'text-dark-muted' : 'text-light-muted'
            }`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDark ? 'text-dark-muted' : 'text-light-muted'
              }`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`input-field pl-10 ${
                  isDark ? 'input-dark' : 'input-light'
                }`}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${
              isDark ? 'text-dark-muted' : 'text-light-muted'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDark ? 'text-dark-muted' : 'text-light-muted'
              }`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input-field pl-10 ${
                  isDark ? 'input-dark' : 'input-light'
                }`}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
              isDark 
                ? 'bg-accent-yellow text-dark-bg hover:bg-accent-yellow/90' 
                : 'bg-accent-green text-white hover:bg-accent-green/90'
            } disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className={`mt-6 text-center text-sm ${
          isDark ? 'text-dark-muted' : 'text-light-muted'
        }`}>
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                className={`font-medium ${
                  isDark ? 'text-accent-yellow hover:underline' : 'text-accent-green hover:underline'
                }`}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
                className={`font-medium ${
                  isDark ? 'text-accent-yellow hover:underline' : 'text-accent-green hover:underline'
                }`}
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-lg transition-colors ${
            isDark 
              ? 'text-dark-muted hover:text-dark-text hover:bg-dark-border' 
              : 'text-light-muted hover:text-light-text hover:bg-light-border'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
