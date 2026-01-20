import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import CommentCard from './CommentCard'
import { BarChart2, MessageSquare, Target, Brain, TrendingUp, Lightbulb, ArrowRight } from 'lucide-react'

export default function AnalysisDisplay({ data }) {
  const { isDark } = useTheme()
  const [viewMode, setViewMode] = useState('comments')
  const { segments, analysis_summary } = data

  // Calculate max pattern count for bar scaling
  const patternCounts = Object.values(analysis_summary?.pattern_distribution || {})
  const maxPatternCount = Math.max(...patternCounts, 1)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Toggle */}
      <div className={`inline-flex p-1 rounded-xl ${
        isDark ? 'bg-dark-card' : 'bg-light-border/50'
      }`}>
        <button
          onClick={() => setViewMode('comments')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
            viewMode === 'comments'
              ? isDark 
                ? 'bg-accent-yellow/20 text-accent-yellow' 
                : 'bg-white text-accent-green shadow-sm'
              : isDark
                ? 'text-dark-muted hover:text-dark-text'
                : 'text-light-muted hover:text-light-text'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Comments ({segments?.length || 0})
        </button>
        <button
          onClick={() => setViewMode('summary')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
            viewMode === 'summary'
              ? isDark 
                ? 'bg-accent-yellow/20 text-accent-yellow' 
                : 'bg-white text-accent-green shadow-sm'
              : isDark
                ? 'text-dark-muted hover:text-dark-text'
                : 'text-light-muted hover:text-light-text'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Summary
        </button>
      </div>

      {viewMode === 'comments' ? (
        <div className="space-y-4">
          {segments?.map((segment) => (
            <CommentCard key={segment.segment_id} segment={segment} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Helpful Thoughts */}
            <div className={`card p-5 ${isDark ? 'card-dark' : 'card-light'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-dark-muted' : 'text-light-muted'
                  }`}>
                    Helpful Thoughts
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${
                    isDark ? 'text-dark-text' : 'text-light-text'
                  }`}>
                    {analysis_summary?.helpful_thought_ratio || '0%'}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${
                  isDark ? 'bg-purple-500/10' : 'bg-purple-50'
                }`}>
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${
                isDark ? 'bg-dark-border' : 'bg-light-border'
              }`}>
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: analysis_summary?.helpful_thought_ratio || '0%' }}
                />
              </div>
            </div>

            {/* Forward Focus */}
            <div className={`card p-5 ${isDark ? 'card-dark' : 'card-light'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-dark-muted' : 'text-light-muted'
                  }`}>
                    Forward Focus
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${
                    isDark ? 'text-dark-text' : 'text-light-text'
                  }`}>
                    {analysis_summary?.focus_direction_ratio?.replace(' forward', '') || '0%'}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${
                  isDark ? 'bg-score-positive/10' : 'bg-green-50'
                }`}>
                  <Target className="w-5 h-5 text-score-positive" />
                </div>
              </div>
              <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${
                isDark ? 'bg-dark-border' : 'bg-light-border'
              }`}>
                <div 
                  className="h-full bg-score-positive rounded-full transition-all duration-500"
                  style={{ width: analysis_summary?.focus_direction_ratio?.replace(' forward', '') || '0%' }}
                />
              </div>
            </div>

            {/* Attribution Quality */}
            <div className={`card p-5 ${isDark ? 'card-dark' : 'card-light'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-dark-muted' : 'text-light-muted'
                  }`}>
                    Attribution Quality
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${
                    isDark ? 'text-dark-text' : 'text-light-text'
                  }`}>
                    {analysis_summary?.average_attribution_quality || 0}
                    <span className={`text-lg font-normal ${
                      isDark ? 'text-dark-muted' : 'text-light-muted'
                    }`}>/10</span>
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${
                  isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                }`}>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <p className={`text-xs mt-2 ${
                isDark ? 'text-dark-muted' : 'text-light-muted'
              }`}>
                {analysis_summary?.attribution_count || 0} attributions found
              </p>
            </div>
          </div>

          {/* Key Insights */}
          {analysis_summary?.key_insights?.length > 0 && (
            <div className={`card p-5 border-l-4 ${
              isDark 
                ? 'card-dark border-l-accent-yellow' 
                : 'card-light border-l-accent-green'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className={`w-5 h-5 ${
                  isDark ? 'text-accent-yellow' : 'text-accent-green'
                }`} />
                <h3 className={`font-semibold ${
                  isDark ? 'text-dark-text' : 'text-light-text'
                }`}>
                  Key Insights
                </h3>
              </div>
              <ul className="space-y-3">
                {analysis_summary.key_insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ArrowRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      isDark ? 'text-accent-yellow' : 'text-accent-green'
                    }`} />
                    <span className={`text-sm ${
                      isDark ? 'text-dark-muted' : 'text-light-muted'
                    }`}>
                      {insight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pattern Distribution */}
          <div className={`card p-5 ${isDark ? 'card-dark' : 'card-light'}`}>
            <h3 className={`font-semibold mb-5 ${
              isDark ? 'text-dark-text' : 'text-light-text'
            }`}>
              Pattern Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(analysis_summary?.pattern_distribution || {}).map(([key, count]) => {
                const percentage = (count / maxPatternCount) * 100
                const isPositive = ['positive_reinforcement', 'tactical_focus', 'forward_focus', 'emotional_regulation', 'energy_management'].includes(key)
                
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm capitalize ${
                        isDark ? 'text-dark-muted' : 'text-light-muted'
                      }`}>
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-sm font-semibold ${
                        isDark ? 'text-dark-text' : 'text-light-text'
                      }`}>
                        {count}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${
                      isDark ? 'bg-dark-border' : 'bg-light-border'
                    }`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPositive ? 'bg-score-positive' : 'bg-score-warning'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dominant Patterns */}
          {analysis_summary?.dominant_patterns?.length > 0 && (
            <div className={`flex flex-wrap gap-2`}>
              <span className={`text-sm ${
                isDark ? 'text-dark-muted' : 'text-light-muted'
              }`}>
                Dominant patterns:
              </span>
              {analysis_summary.dominant_patterns.map((pattern, idx) => (
                <span 
                  key={idx}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isDark 
                      ? 'bg-accent-yellow/20 text-accent-yellow' 
                      : 'bg-accent-green/10 text-accent-green'
                  }`}
                >
                  {pattern.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}