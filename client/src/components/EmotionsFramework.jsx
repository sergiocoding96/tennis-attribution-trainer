import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { ArrowLeft, Activity } from 'lucide-react'

const EmotionsFramework = ({ onClose }) => {
  const { isDark } = useTheme()
  const [activeEmotion, setActiveEmotion] = useState('calmness')
  const [emotions, setEmotions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch emotion framework data from API
    fetch('/api/emotions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmotions(data.data.emotions)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load emotions:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className={`p-8 rounded-2xl ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
          <div className="animate-spin w-8 h-8 border-4 border-accent-yellow border-t-transparent rounded-full mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
            Loading Emotion Framework...
          </p>
        </div>
      </div>
    )
  }

  if (!emotions) {
    return null
  }

  const emotionKeys = Object.keys(emotions)
  const currentEmotion = emotions[activeEmotion]

  const getColorClasses = (emotion) => {
    const colors = {
      disappointment: 'from-gray-500 to-gray-600',
      frustration: 'from-amber-500 to-amber-600',
      anger: 'from-red-500 to-red-600',
      anxiety: 'from-purple-500 to-purple-600',
      calmness: 'from-blue-500 to-blue-600',
      excitement: 'from-green-500 to-green-600'
    }
    return colors[emotion] || 'from-blue-500 to-blue-600'
  }

  const getDangerColor = (danger) => {
    if (danger === 'Critical' || danger === 'High') return 'text-red-500'
    if (danger === 'Moderate-High' || danger === 'Moderate') return 'text-amber-500'
    return 'text-green-500'
  }

  const isInPeakZone = currentEmotion.danger === 'Low'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <button
              onClick={onClose}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 transition-all ${
                isDark 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-black/10 hover:bg-black/20 text-gray-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Analysis
            </button>
            
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full mb-4">
              <Activity className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Tennis Mental Game</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Master Your Emotions
            </h1>
            <p className="text-white/70 text-lg">
              Understand and regulate your emotional state for peak performance
            </p>
          </div>

          {/* Emotion Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {emotionKeys.map(key => {
              const emotion = emotions[key]
              return (
                <button
                  key={key}
                  onClick={() => setActiveEmotion(key)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    activeEmotion === key
                      ? `bg-gradient-to-r ${getColorClasses(key)} text-white shadow-lg scale-105`
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <span className="text-2xl mr-2">{emotion.icon}</span>
                  {emotion.name}
                </button>
              )
            })}
          </div>

          {/* Emotion Details Card */}
          <div className={`rounded-2xl overflow-hidden shadow-2xl ${
            isDark ? 'bg-dark-card' : 'bg-white'
          }`}>
            {/* Gradient Header */}
            <div className={`bg-gradient-to-r ${getColorClasses(activeEmotion)} p-8 text-white`}>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-6xl">{currentEmotion.icon}</span>
                <div>
                  <h2 className="text-3xl font-bold">{currentEmotion.name}</h2>
                  <p className="text-white/90 text-lg">{currentEmotion.nameEs}</p>
                </div>
              </div>
              <p className="text-white/90 text-lg">{currentEmotion.description}</p>
              <p className="text-white/70 italic">{currentEmotion.descriptionEs}</p>
            </div>

            {/* Metrics Grid */}
            <div className="p-8">
              {/* Peak Zone Indicator */}
              {isInPeakZone && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl">
                  <p className="text-green-700 dark:text-green-400 font-bold text-center">
                    ✅ This emotion is in the PEAK PERFORMANCE ZONE
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className={`p-4 rounded-xl text-center ${
                  isDark ? 'bg-dark-bg' : 'bg-gray-50'
                }`}>
                  <div className={`text-sm mb-1 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                    ENERGY LEVEL
                  </div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                    {currentEmotion.arousal}/10
                  </div>
                </div>

                <div className={`p-4 rounded-xl text-center ${
                  isDark ? 'bg-dark-bg' : 'bg-gray-50'
                }`}>
                  <div className={`text-sm mb-1 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                    FEELING
                  </div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                    {currentEmotion.valence}/10
                  </div>
                </div>

                <div className={`p-4 rounded-xl text-center ${
                  isDark ? 'bg-dark-bg' : 'bg-gray-50'
                }`}>
                  <div className={`text-sm mb-1 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                    TIME FOCUS
                  </div>
                  <div className={`text-lg font-bold ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                    {currentEmotion.timeline}
                  </div>
                </div>

                <div className={`p-4 rounded-xl text-center ${
                  isDark ? 'bg-dark-bg' : 'bg-gray-50'
                }`}>
                  <div className={`text-sm mb-1 ${isDark ? 'text-dark-muted' : 'text-gray-600'}`}>
                    DANGER LEVEL
                  </div>
                  <div className={`text-lg font-bold ${getDangerColor(currentEmotion.danger)}`}>
                    {currentEmotion.danger}
                  </div>
                </div>
              </div>

              {/* Psychological Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-bg' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold mb-2 ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                    🎯 Mindset Type
                  </h3>
                  <p className={isDark ? 'text-dark-muted' : 'text-gray-700'}>
                    {currentEmotion.ego}
                  </p>
                </div>

                <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-bg' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold mb-2 ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                    🎮 Control Level
                  </h3>
                  <p className={isDark ? 'text-dark-muted' : 'text-gray-700'}>
                    {currentEmotion.controllability}
                  </p>
                </div>
              </div>

              {/* Trigger Phrases */}
              <div className={`p-6 rounded-xl mb-6 ${
                isDark ? 'bg-dark-bg border border-dark-border' : 'bg-amber-50 border border-amber-200'
              }`}>
                <h3 className={`font-bold mb-3 ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>
                  💬 Trigger Phrases
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentEmotion.triggerPhrases.map((phrase, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isDark 
                          ? 'bg-dark-card text-dark-text' 
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>

              {/* Reset Action */}
              <div className={`p-6 rounded-xl bg-gradient-to-r ${getColorClasses(activeEmotion)} text-white`}>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  ⚡ Reset Action
                </h3>
                <p className="text-lg font-semibold mb-1">{currentEmotion.resetAction}</p>
                <p className="text-white/80 italic">{currentEmotion.resetActionEs}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmotionsFramework
