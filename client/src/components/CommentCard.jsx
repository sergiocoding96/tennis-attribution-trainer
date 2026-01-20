import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { ChevronDown, ChevronUp, Edit2, Check, X, Loader2, Target, AlertCircle, CheckCircle } from 'lucide-react'
import axios from 'axios'

export default function CommentCard({ segment }) {
  const { isDark } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(segment.quote)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [segmentState, setSegmentState] = useState(segment)

  const score = segmentState.helpfulness_score || 5
  
  const getScoreConfig = (score) => {
    if (score >= 8) return {
      bg: isDark ? 'bg-score-positive/20' : 'bg-green-50',
      text: 'text-score-positive',
      border: 'border-score-positive',
      icon: CheckCircle,
      label: 'Helpful'
    }
    if (score >= 5) return {
      bg: isDark ? 'bg-score-warning/20' : 'bg-amber-50',
      text: 'text-score-warning',
      border: 'border-score-warning',
      icon: AlertCircle,
      label: 'Moderate'
    }
    return {
      bg: isDark ? 'bg-score-negative/20' : 'bg-red-50',
      text: 'text-score-negative',
      border: 'border-score-negative',
      icon: AlertCircle,
      label: 'Needs Work'
    }
  }

  const scoreConfig = getScoreConfig(score)
  const ScoreIcon = scoreConfig.icon

  const handleReframe = async () => {
    if (!editValue.trim() || editValue === segmentState.quote) return

    setIsSubmitting(true)
    try {
      const response = await axios.post('/api/score-reframe', {
        original_quote: segmentState.quote,
        player_reframe: editValue,
        context: segmentState.situation || 'tennis practice'
      })

      if (response.data.success) {
        setSegmentState(prev => ({
          ...prev,
          quote: editValue,
          helpfulness_score: response.data.score || response.data.overall_score,
        }))
        setIsEditing(false)
      }
    } catch (err) {
      console.error('Reframe failed', err)
      alert('Failed to score reframe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`card overflow-hidden transition-all duration-300 ${
      isDark ? 'card-dark' : 'card-light'
    } ${expanded ? 'ring-2 ' + (isDark ? 'ring-accent-yellow/30' : 'ring-accent-green/30') : ''}`}>
      {/* Header - Always visible */}
      <div 
        className={`p-4 cursor-pointer transition-colors duration-200 ${
          !isEditing && (isDark ? 'hover:bg-dark-border/30' : 'hover:bg-light-border/30')
        }`}
        onClick={() => !isEditing && setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          {/* Score Badge */}
          <div className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg ${scoreConfig.bg}`}>
            <span className={`text-lg font-bold ${scoreConfig.text}`}>{score}</span>
            <span className={`text-[10px] font-medium uppercase tracking-wide ${scoreConfig.text}`}>
              /10
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`badge ${scoreConfig.bg} ${scoreConfig.text}`}>
                <ScoreIcon className="w-3 h-3 mr-1" />
                {scoreConfig.label}
              </span>
              
              {segmentState.attribution_analysis?.has_attribution && (
                <span className={`badge ${
                  isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Target className="w-3 h-3 mr-1" />
                  Attribution
                </span>
              )}

              {segmentState.timestamp && (
                <span className={`text-xs font-mono ${
                  isDark ? 'text-dark-muted' : 'text-light-muted'
                }`}>
                  {segmentState.timestamp}
                </span>
              )}
            </div>
            
            {isEditing ? (
              <div onClick={e => e.stopPropagation()}>
                <textarea
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className={`input-field text-sm resize-none ${
                    isDark ? 'input-dark' : 'input-light'
                  }`}
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={handleReframe}
                    disabled={isSubmitting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDark 
                        ? 'bg-accent-yellow text-dark-bg hover:bg-accent-yellow/90' 
                        : 'bg-accent-green text-white hover:bg-accent-green/90'
                    } disabled:opacity-50`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Save Reframe
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false)
                      setEditValue(segmentState.quote)
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDark 
                        ? 'bg-dark-border text-dark-muted hover:text-dark-text' 
                        : 'bg-light-border text-light-muted hover:text-light-text'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-base leading-relaxed ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                "{segmentState.quote}"
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isEditing && score < 8 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                  setExpanded(true)
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-dark-muted hover:text-accent-yellow hover:bg-accent-yellow/10' 
                    : 'text-light-muted hover:text-accent-green hover:bg-accent-green/10'
                }`}
                title="Reframe this thought"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <div className={`p-2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className={`px-4 pb-4 animate-slide-down border-t ${
          isDark ? 'border-dark-border' : 'border-light-border'
        }`}>
          {/* Attribution Analysis */}
          {segmentState.attribution_analysis?.has_attribution && (
            <div className={`mt-4 p-4 rounded-xl ${
              isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'
            }`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                isDark ? 'text-blue-400' : 'text-blue-700'
              }`}>
                Attribution Analysis
              </h4>
              
              <p className={`text-sm mb-3 ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                "{segmentState.attribution_analysis.attribution_statement}"
              </p>
              
              {/* Dimensions Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {Object.entries(segmentState.attribution_analysis.dimensions || {}).map(([key, val]) => (
                  <div key={key} className={`text-center p-2 rounded-lg ${
                    isDark ? 'bg-dark-bg/50' : 'bg-white/80'
                  }`}>
                    <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${
                      isDark ? 'text-blue-400/70' : 'text-blue-500'
                    }`}>
                      {key}
                    </div>
                    <div className={`text-xs font-semibold capitalize ${
                      isDark ? 'text-dark-text' : 'text-light-text'
                    }`}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quality Score */}
              {segmentState.attribution_analysis.attribution_quality_score && (
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    isDark ? 'text-blue-400/70' : 'text-blue-600'
                  }`}>
                    Quality Score
                  </span>
                  <span className={`text-sm font-bold ${
                    isDark ? 'text-blue-400' : 'text-blue-700'
                  }`}>
                    {segmentState.attribution_analysis.attribution_quality_score}/10
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Psychological Patterns */}
          {segmentState.psychological_patterns?.length > 0 && (
            <div className="mt-4">
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                isDark ? 'text-dark-muted' : 'text-light-muted'
              }`}>
                Psychological Patterns
              </h4>
              <div className="space-y-2">
                {segmentState.psychological_patterns.map((pattern, idx) => {
                  const patternScore = pattern.helpfulness_score || 5
                  const isPositive = patternScore >= 7
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        isDark ? 'bg-dark-bg/50' : 'bg-light-border/30'
                      }`}
                    >
                      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                        isPositive ? 'bg-score-positive' : 'bg-score-warning'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-sm font-semibold capitalize ${
                            isDark ? 'text-dark-text' : 'text-light-text'
                          }`}>
                            {pattern.type?.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isPositive 
                              ? 'bg-score-positive/20 text-score-positive' 
                              : 'bg-score-warning/20 text-score-warning'
                          }`}>
                            {patternScore}/10
                          </span>
                        </div>
                        <p className={`text-sm ${
                          isDark ? 'text-dark-muted' : 'text-light-muted'
                        }`}>
                          {pattern.explanation}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Focus Direction */}
          {segmentState.focus_direction && (
            <div className={`mt-4 flex items-center gap-2 text-xs ${
              isDark ? 'text-dark-muted' : 'text-light-muted'
            }`}>
              <span>Focus Direction:</span>
              <span className={`px-2 py-0.5 rounded font-medium capitalize ${
                segmentState.focus_direction === 'forward'
                  ? 'bg-score-positive/20 text-score-positive'
                  : segmentState.focus_direction === 'backward'
                    ? 'bg-score-negative/20 text-score-negative'
                    : isDark ? 'bg-dark-border text-dark-text' : 'bg-light-border text-light-text'
              }`}>
                {segmentState.focus_direction}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}