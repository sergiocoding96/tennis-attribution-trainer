import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Clock, TrendingUp, BarChart2, ChevronRight, Loader2 } from 'lucide-react'

export default function SessionHistory({ onSelectSession }) {
  const { isDark } = useTheme()
  const { user, isAuthenticated } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user && supabase) {
      fetchSessions()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, created_at, session_type, helpful_thought_ratio, average_attribution_quality, total_segments')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setSessions(data || [])
    } catch (err) {
      console.error('Error fetching sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSession = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) throw error
      if (data?.analysis_json) {
        onSelectSession(data.analysis_json)
      }
    } catch (err) {
      console.error('Error loading session:', err)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getSessionTypeLabel = (type) => {
    const labels = {
      match: 'Match',
      practice: 'Practice',
      training: 'Training',
      reflection: 'Reflection'
    }
    return labels[type] || type
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className={`card p-4 ${isDark ? 'card-dark' : 'card-light'}`}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className={`w-5 h-5 animate-spin ${
            isDark ? 'text-dark-muted' : 'text-light-muted'
          }`} />
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className={`card p-4 ${isDark ? 'card-dark' : 'card-light'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Clock className={`w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
          <h3 className={`text-sm font-medium ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
            Session History
          </h3>
        </div>
        <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
          No sessions yet. Complete an analysis to start tracking your progress.
        </p>
      </div>
    )
  }

  return (
    <div className={`card overflow-hidden ${isDark ? 'card-dark' : 'card-light'}`}>
      <div className={`px-4 py-3 border-b ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
          <h3 className={`text-sm font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Recent Sessions
          </h3>
        </div>
      </div>

      <div className="divide-y divide-dark-border">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => loadSession(session.id)}
            className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
              isDark 
                ? 'hover:bg-dark-border/30' 
                : 'hover:bg-light-border/30'
            }`}
          >
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  isDark 
                    ? 'bg-dark-border text-dark-muted' 
                    : 'bg-light-border text-light-muted'
                }`}>
                  {getSessionTypeLabel(session.session_type)}
                </span>
                <span className={`text-xs ${
                  isDark ? 'text-dark-muted' : 'text-light-muted'
                }`}>
                  {formatDate(session.created_at)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                {session.helpful_thought_ratio && (
                  <span className={`flex items-center gap-1 ${
                    isDark ? 'text-dark-muted' : 'text-light-muted'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {session.helpful_thought_ratio} helpful
                  </span>
                )}
                {session.total_segments && (
                  <span className={`flex items-center gap-1 ${
                    isDark ? 'text-dark-muted' : 'text-light-muted'
                  }`}>
                    <BarChart2 className="w-3 h-3" />
                    {session.total_segments} segments
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className={`w-4 h-4 ${
              isDark ? 'text-dark-muted' : 'text-light-muted'
            }`} />
          </button>
        ))}
      </div>
    </div>
  )
}
