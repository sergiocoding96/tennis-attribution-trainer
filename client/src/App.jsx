import { useState } from 'react'
import { useTheme } from './context/ThemeContext'
import { useAuth } from './context/AuthContext'
import TranscriptionUpload from './components/TranscriptionUpload'
import AnalysisDisplay from './components/AnalysisDisplay'
import SessionHistory from './components/SessionHistory'
import Auth from './components/Auth'
import { Activity, Sun, Moon, Loader2, FileAudio, User, LogOut } from 'lucide-react'

function App() {
  const { toggleTheme, isDark } = useTheme()
  const { user, profile, isAuthenticated, isConfigured, signOut, loading: authLoading } = useAuth()
  const [analysisData, setAnalysisData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  const handleSelectSession = (data) => {
    setAnalysisData(data)
    setError(null)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-dark-bg' : 'bg-gradient-light'
    }`}>
      {/* Auth Modal */}
      {showAuth && <Auth onClose={() => setShowAuth(false)} />}

      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-dark-bg/80 border-dark-border' 
          : 'bg-white/80 border-light-border'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                isDark ? 'bg-accent-yellow/10' : 'bg-accent-green/10'
              }`}>
                <Activity className={`w-6 h-6 ${
                  isDark ? 'text-accent-yellow' : 'text-accent-green'
                }`} />
              </div>
              <div>
                <h1 className={`text-lg font-bold tracking-tight ${
                  isDark ? 'text-dark-text' : 'text-light-text'
                }`}>
                  Tennis Attribution
                </h1>
                <p className={`text-xs ${
                  isDark ? 'text-dark-muted' : 'text-light-muted'
                }`}>
                  Performance Psychology Trainer
                </p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Auth Button */}
              {isConfigured && (
                isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                      isDark ? 'bg-dark-card' : 'bg-light-border/50'
                    }`}>
                      <User className={`w-4 h-4 ${
                        isDark ? 'text-dark-muted' : 'text-light-muted'
                      }`} />
                      <span className={`text-sm ${
                        isDark ? 'text-dark-text' : 'text-light-text'
                      }`}>
                        {profile?.full_name || user?.email?.split('@')[0]}
                      </span>
                    </div>
                    <button
                      onClick={signOut}
                      className={`p-2.5 rounded-xl transition-all duration-200 ${
                        isDark 
                          ? 'bg-dark-card hover:bg-dark-border text-dark-muted hover:text-score-negative' 
                          : 'bg-light-border/50 hover:bg-light-border text-light-muted hover:text-score-negative'
                      }`}
                      title="Sign out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      isDark 
                        ? 'bg-accent-yellow/20 text-accent-yellow hover:bg-accent-yellow/30' 
                        : 'bg-accent-green/10 text-accent-green hover:bg-accent-green/20'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  isDark 
                    ? 'bg-dark-card hover:bg-dark-border text-dark-muted hover:text-accent-yellow' 
                    : 'bg-light-border/50 hover:bg-light-border text-light-muted hover:text-accent-green'
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Panel - Input */}
          <div className="lg:col-span-4 space-y-6">
            <TranscriptionUpload 
              setAnalysisData={setAnalysisData} 
              setLoading={setLoading}
              setError={setError}
            />
            
            {/* Session History (only if authenticated) */}
            {isAuthenticated && (
              <SessionHistory onSelectSession={handleSelectSession} />
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className={`card flex flex-col items-center justify-center h-80 ${
                isDark ? 'card-dark' : 'card-light'
              }`}>
                <div className={`p-4 rounded-full mb-4 ${
                  isDark ? 'bg-accent-yellow/10' : 'bg-accent-green/10'
                }`}>
                  <Loader2 className={`w-8 h-8 animate-spin ${
                    isDark ? 'text-accent-yellow' : 'text-accent-green'
                  }`} />
                </div>
                <p className={`font-medium ${
                  isDark ? 'text-dark-text' : 'text-light-text'
                }`}>
                  Analyzing performance patterns...
                </p>
                <p className={`text-sm mt-2 ${
                  isDark ? 'text-dark-muted' : 'text-light-muted'
                }`}>
                  Consulting Claude AI for psychological insights
                </p>
              </div>
            ) : error ? (
              <div className={`card p-6 border-2 ${
                isDark 
                  ? 'bg-score-negative/10 border-score-negative/30' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className="text-score-negative font-semibold mb-2">Analysis Failed</p>
                <p className={`text-sm ${
                  isDark ? 'text-dark-muted' : 'text-light-muted'
                }`}>{error}</p>
              </div>
            ) : analysisData ? (
              <AnalysisDisplay data={analysisData} />
            ) : (
              <div className={`card flex flex-col items-center justify-center h-80 border-2 border-dashed ${
                isDark 
                  ? 'card-dark border-dark-border pattern-bg-dark' 
                  : 'card-light border-light-border pattern-bg-light'
              }`}>
                <div className={`p-4 rounded-full mb-4 ${
                  isDark ? 'bg-dark-border' : 'bg-light-border'
                }`}>
                  <FileAudio className={`w-8 h-8 ${
                    isDark ? 'text-dark-muted' : 'text-light-muted'
                  }`} />
                </div>
                <p className={`font-medium ${
                  isDark ? 'text-dark-text' : 'text-light-text'
                }`}>
                  Ready to Analyze
                </p>
                <p className={`text-sm mt-2 text-center max-w-sm px-4 ${
                  isDark ? 'text-dark-muted' : 'text-light-muted'
                }`}>
                  Upload an audio recording or paste your post-match thoughts to receive psychological attribution insights.
                </p>
                {!isAuthenticated && isConfigured && (
                  <button
                    onClick={() => setShowAuth(true)}
                    className={`mt-4 text-sm font-medium ${
                      isDark ? 'text-accent-yellow hover:underline' : 'text-accent-green hover:underline'
                    }`}
                  >
                    Sign in to save your sessions
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-6 mt-8 border-t ${
        isDark ? 'border-dark-border' : 'border-light-border'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={`text-center text-sm ${
            isDark ? 'text-dark-muted' : 'text-light-muted'
          }`}>
            Powered by Sports Psychology & AI • Built for Tennis Academies
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App