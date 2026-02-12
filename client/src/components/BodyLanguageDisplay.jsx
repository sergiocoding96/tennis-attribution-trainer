import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Clock, Zap, ChevronDown, ChevronRight, Film, Activity, Edit3, Check } from 'lucide-react'
import axios from 'axios'
import { supabase } from '../lib/supabase'

const EMOTION_OPTIONS = ['neutral', 'calm', 'relief', 'excitement', 'joy', 'disappointment', 'frustration', 'anger', 'defeat', 'resignation']

export default function BodyLanguageDisplay({ data, videoUrl }) {
  const { isDark } = useTheme()
  const videoRef = useRef(null)
  const [expandedId, setExpandedId] = useState(null)
  const [currentWindowIndex, setCurrentWindowIndex] = useState(null)
  const [corrections, setCorrections] = useState({})
  const [correctionDraft, setCorrectionDraft] = useState({})
  const [savingIdx, setSavingIdx] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const windows = data?.windows ?? []
  const videoDuration = data?.video_duration_seconds ?? 0
  const videoFps = data?.video_fps ?? 0

  const getDisplayValence = (win, idx) => (corrections[idx]?.corrected_valence != null ? corrections[idx].corrected_valence : win.valence)
  const getDisplayEmotion = (win, idx) => (corrections[idx]?.corrected_emotion != null ? corrections[idx].corrected_emotion : (win.emotion ?? 'neutral'))

  const buildFeatures = (win) => {
    const posture = win.posture_metrics || {}
    const motion = win.motion_metrics || {}
    const gestureNames = (win.detected_gestures || []).map((g) => (typeof g === 'object' ? g.gesture : g))
    const gestureSet = new Set(gestureNames)
    return {
      shoulder_angle_deg: posture.shoulder_angle_deg ?? 0,
      head_tilt_deg: posture.head_tilt_deg ?? 0,
      torso_expansion: posture.torso_expansion ?? 0,
      velocity_nose_avg: motion.velocity_nose_avg ?? 0,
      gait_stability: motion.gait_stability ?? 0,
      intensity: win.intensity ?? 0,
      confidence_score: win.confidence_score ?? 0,
      gesture_fist_pump: gestureSet.has('fist_pump') ? 1 : 0,
      gesture_head_down: gestureSet.has('head_down') ? 1 : 0,
      gesture_racket_drop: gestureSet.has('racket_drop') ? 1 : 0,
      gesture_shoulder_slump: gestureSet.has('shoulder_slump') ? 1 : 0,
      gesture_hands_on_hips: gestureSet.has('hands_on_hips') ? 1 : 0,
      gesture_head_shake: gestureSet.has('head_shake') ? 1 : 0,
    }
  }

  const saveCorrection = async (idx, correctedValence, correctedEmotion) => {
    const win = windows[idx]
    if (!win) return
    setSavingIdx(idx)
    setSaveError(null)
    try {
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } }
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      await axios.post(
        '/api/body-language/corrections',
        {
          window_index: idx,
          timestamp_start: win.timestamp_start,
          timestamp_end: win.timestamp_end,
          original_valence: win.valence,
          original_emotion: win.emotion ?? 'neutral',
          corrected_valence: correctedValence,
          corrected_emotion: correctedEmotion || null,
          features: buildFeatures(win),
        },
        { headers }
      )
      setCorrections((prev) => ({ ...prev, [idx]: { corrected_valence: correctedValence, corrected_emotion: correctedEmotion || null } }))
      setSaveError(null)
    } catch (err) {
      setSaveError(err.response?.data?.error || err.message || 'Failed to save correction')
    } finally {
      setSavingIdx(null)
    }
  }

  // Sync highlight to video currentTime
  useEffect(() => {
    const video = videoRef.current
    if (!video || !windows.length) return
    const onTimeUpdate = () => {
      const t = video.currentTime
      const idx = windows.findIndex((w) => t >= (w.timestamp_start ?? 0) && t <= (w.timestamp_end ?? Infinity))
      setCurrentWindowIndex(idx >= 0 ? idx : null)
    }
    video.addEventListener('timeupdate', onTimeUpdate)
    onTimeUpdate()
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [videoUrl, windows])

  const valenceColor = (valence) => {
    if (valence === 'positive') return isDark ? 'text-score-positive' : 'text-green-600'
    if (valence === 'negative') return 'text-score-negative'
    return isDark ? 'text-dark-muted' : 'text-light-muted'
  }

  const valenceBgColor = (valence) => {
    if (valence === 'positive') return isDark ? 'bg-green-500/60' : 'bg-green-500'
    if (valence === 'negative') return isDark ? 'bg-red-500/60' : 'bg-red-500'
    return isDark ? 'bg-dark-border' : 'bg-gray-300'
  }

  const positiveCount = windows.filter((w, i) => getDisplayValence(w, i) === 'positive').length
  const negativeCount = windows.filter((w, i) => getDisplayValence(w, i) === 'negative').length
  const neutralCount = windows.filter((w, i) => getDisplayValence(w, i) === 'neutral').length
  const total = windows.length
  const pctPos = total ? Math.round((positiveCount / total) * 100) : 0
  const pctNeg = total ? Math.round((negativeCount / total) * 100) : 0
  const pctNeut = total ? Math.round((neutralCount / total) * 100) : 0
  const summaryLine =
    total === 0
      ? 'No windows analyzed.'
      : pctPos >= 50
        ? `Mostly positive (${pctPos}% of windows)${pctNeg > 0 ? ` with ${negativeCount} negative window${negativeCount !== 1 ? 's' : ''}` : ''}.`
        : pctNeg >= 50
          ? `More negative (${pctNeg}%) than positive (${pctPos}%).`
          : `Mixed: ${pctPos}% positive, ${pctNeut}% neutral, ${pctNeg}% negative.`

  const seekToWindow = (win) => {
    if (videoRef.current && win?.timestamp_start != null) {
      videoRef.current.currentTime = win.timestamp_start
      videoRef.current.play().catch(() => {})
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Video player with on-video analysis overlay */}
      {videoUrl && (
        <div className={`card overflow-hidden p-0 ${isDark ? 'card-dark' : 'card-light'}`}>
          <div className="relative w-full aspect-video bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
              playsInline
            />
            {/* Analysis overlay on the video - updates with playback */}
            {windows.length > 0 && (
              <div
                className={`absolute inset-x-0 bottom-0 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 ${
                  isDark ? 'bg-black/75' : 'bg-black/70'
                }`}
              >
                {currentWindowIndex != null && currentWindowIndex >= 0 && currentWindowIndex < windows.length ? (
                  <>
                    <span
                      className={`font-medium capitalize ${
                        getDisplayValence(windows[currentWindowIndex], currentWindowIndex) === 'positive'
                          ? 'text-green-400'
                          : getDisplayValence(windows[currentWindowIndex], currentWindowIndex) === 'negative'
                            ? 'text-red-400'
                            : 'text-white/90'
                      }`}
                    >
                      {getDisplayValence(windows[currentWindowIndex], currentWindowIndex)}
                    </span>
                    <span className="text-white/90 font-medium capitalize">
                      {getDisplayEmotion(windows[currentWindowIndex], currentWindowIndex)}
                    </span>
                    <span className="text-white/80 text-sm">
                      {windows[currentWindowIndex].timestamp_start?.toFixed(1)}s – {windows[currentWindowIndex].timestamp_end?.toFixed(1)}s
                    </span>
                    <span className="text-white/70 text-sm">
                      <Zap className="w-3.5 h-3.5 inline mr-0.5" />
                      {windows[currentWindowIndex].intensity ?? 0}/10
                    </span>
                    {windows[currentWindowIndex].detected_gestures?.length > 0 && (
                      <span className="text-white/70 text-sm">
                        {windows[currentWindowIndex].detected_gestures.map((g) => (typeof g === 'object' ? g.gesture : g)).join(', ')}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-white/70 text-sm">Seek or play to see segment analysis</span>
                )}
              </div>
            )}
          </div>
          <p className={`px-4 py-2 text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
            Play the video and use the timeline below to verify each segment. Click a time window to jump to that moment.
          </p>
        </div>
      )}

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
        <p className={`text-sm ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{summaryLine}</p>
        {windows.length > 0 && (
          <div className="mt-3 flex items-center gap-1">
            <Activity className={`w-4 h-4 shrink-0 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`} />
            <div className="flex flex-1 gap-0.5 min-h-[8px] rounded overflow-hidden">
              {windows.map((win, idx) => (
                <div
                  key={idx}
                  className={`flex-1 min-w-[4px] ${valenceBgColor(getDisplayValence(win, idx))}`}
                  title={`${win.timestamp_start?.toFixed(1)}s–${win.timestamp_end?.toFixed(1)}s: ${getDisplayValence(win, idx)} (${getDisplayEmotion(win, idx)})`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timeline of windows */}
      <div className="space-y-4">
        {windows.map((win, idx) => {
          const id = `win-${idx}`
          const isExpanded = expandedId === id
          const isCurrent = currentWindowIndex === idx
          return (
            <div
              key={id}
              className={`card overflow-hidden ${isDark ? 'card-dark' : 'card-light'} ${
                isCurrent ? 'ring-2 ring-offset-2 ' + (isDark ? 'ring-accent-yellow ring-offset-dark-bg' : 'ring-accent-green ring-offset-white') : ''
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setExpandedId(isExpanded ? null : id)
                  seekToWindow(win)
                }}
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
                  <span className={`font-medium capitalize ${valenceColor(getDisplayValence(win, idx))}`}>
                    {getDisplayValence(win, idx)}
                    {corrections[idx] && (
                      <span className="ml-1 opacity-70" title="Corrected by you">(corrected)</span>
                    )}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    <Zap className="w-4 h-4 inline mr-1" />
                    {win.intensity ?? 0}/10
                  </span>
                  <span className={`text-sm font-medium capitalize ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {getDisplayEmotion(win, idx)}
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
                        {win.motion_metrics.gait_stability != null && (
                          <> • gait stability {(win.motion_metrics.gait_stability).toFixed(2)}</>
                        )}
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
                  {/* Human-in-the-loop: correct valence/emotion */}
                  <div className={`pt-3 mt-3 border-t ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
                    <p className={`text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                      <Edit3 className="w-3.5 h-3.5" />
                      Correct this segment
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2">
                        <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Valence</span>
                        <select
                          value={correctionDraft[idx]?.valence ?? getDisplayValence(win, idx)}
                          onChange={(e) => setCorrectionDraft((prev) => ({ ...prev, [idx]: { ...prev[idx], valence: e.target.value } }))}
                          className={`rounded-lg px-2 py-1.5 text-sm border ${isDark ? 'bg-dark-card border-dark-border text-dark-text' : 'bg-white border-light-border text-light-text'}`}
                        >
                          <option value="positive">Positive</option>
                          <option value="neutral">Neutral</option>
                          <option value="negative">Negative</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2">
                        <span className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Emotion</span>
                        <select
                          value={correctionDraft[idx]?.emotion ?? getDisplayEmotion(win, idx)}
                          onChange={(e) => setCorrectionDraft((prev) => ({ ...prev, [idx]: { ...prev[idx], emotion: e.target.value } }))}
                          className={`rounded-lg px-2 py-1.5 text-sm border ${isDark ? 'bg-dark-card border-dark-border text-dark-text' : 'bg-white border-light-border text-light-text'}`}
                        >
                          {EMOTION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        disabled={savingIdx === idx}
                        onClick={() => saveCorrection(idx, correctionDraft[idx]?.valence ?? getDisplayValence(win, idx), correctionDraft[idx]?.emotion ?? getDisplayEmotion(win, idx))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                          isDark ? 'bg-accent-yellow/20 text-accent-yellow hover:bg-accent-yellow/30' : 'bg-accent-green/20 text-accent-green hover:bg-accent-green/30'
                        } disabled:opacity-50`}
                      >
                        {savingIdx === idx ? 'Saving…' : <><Check className="w-3.5 h-3.5" /> Save correction</>}
                      </button>
                    </div>
                    {saveError && savingIdx === null && (
                      <p className="mt-2 text-xs text-score-negative">{saveError}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
