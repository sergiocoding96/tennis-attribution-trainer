import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Clock, Zap, ChevronDown, ChevronRight, Film } from 'lucide-react'

export default function BodyLanguageDisplay({ data }) {
  const { isDark } = useTheme()
  const [expandedId, setExpandedId] = useState(null)
  const windows = data?.windows ?? []
  const videoDuration = data?.video_duration_seconds ?? 0
  const videoFps = data?.video_fps ?? 0

  const valenceColor = (valence) => {
    if (valence === 'positive') return isDark ? 'text-score-positive' : 'text-green-600'
    if (valence === 'negative') return 'text-score-negative'
    return isDark ? 'text-dark-muted' : 'text-light-muted'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary header */}
      <div className={`card p-5 ${isDark ? 'card-dark' : 'card-light'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-accent-yellow/10' : 'bg-accent-green/10'}`}>
            <Film className={`w-5 h-5 ${isDark ? 'text-accent-yellow' : 'text-accent-green'}`} />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Body Language Analysis
            </h2>
            <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
              {windows.length} time window{windows.length !== 1 ? 's' : ''} • {videoDuration.toFixed(1)}s video @ {videoFps.toFixed(0)} fps
            </p>
          </div>
        </div>
      </div>

      {/* Timeline of windows */}
      <div className="space-y-4">
        {windows.map((win, idx) => {
          const id = `win-${idx}`
          const isExpanded = expandedId === id
          return (
            <div
              key={id}
              className={`card overflow-hidden ${isDark ? 'card-dark' : 'card-light'}`}
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : id)}
                className="w-full p-5 text-left flex items-center gap-4"
              >
                <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-border' : 'bg-light-border'}`}>
                  {isExpanded ? (
                    <ChevronDown className={`w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                  ) : (
                    <ChevronRight className={`w-4 h-4 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap flex-1">
                  <span className={`flex items-center gap-1.5 text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    <Clock className="w-4 h-4" />
                    {win.timestamp_start?.toFixed(1)}s – {win.timestamp_end?.toFixed(1)}s
                  </span>
                  <span className={`font-medium capitalize ${valenceColor(win.valence)}`}>
                    {win.valence}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    <Zap className="w-4 h-4 inline mr-1" />
                    {win.intensity ?? 0}/10
                  </span>
                  <span className={`text-sm font-medium capitalize ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {win.emotion ?? 'neutral'}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    Confidence {(win.confidence_score ?? 0).toFixed(2)}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className={`border-t px-5 py-4 space-y-3 ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                  {win.detected_gestures?.length > 0 && (
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        Gestures
                      </p>
                      <p className={`text-sm ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        {win.detected_gestures.map((g) => (typeof g === 'object' ? g.gesture : g)).join(', ') || 'None'}
                      </p>
                    </div>
                  )}
                  {win.posture_metrics && Object.keys(win.posture_metrics).length > 0 && (
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        Posture
                      </p>
                      <p className={`text-sm ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        shoulder {win.posture_metrics.shoulder_angle_deg?.toFixed(1)}° •
                        head tilt {win.posture_metrics.head_tilt_deg?.toFixed(1)}° •
                        torso {win.posture_metrics.torso_expansion?.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {win.motion_metrics && Object.keys(win.motion_metrics).length > 0 && (
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        Motion
                      </p>
                      <p className={`text-sm ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        velocity (nose) {win.motion_metrics.velocity_nose_avg?.toFixed(3) ?? '—'}
                      </p>
                    </div>
                  )}
                  {win.explanation_text && (
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                        Coach note
                      </p>
                      <p className={`text-sm italic ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        {win.explanation_text}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
