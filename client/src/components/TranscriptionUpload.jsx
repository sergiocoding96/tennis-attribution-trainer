import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import { Upload, FileText, Play, Mic, Database, Loader2 } from 'lucide-react'

export default function TranscriptionUpload({ setAnalysisData, setLoading, setError }) {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('text')
  const [textInput, setTextInput] = useState('')
  const [file, setFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return
    
    setLoading(true)
    setError(null)
    setIsProcessing(true)
    
    try {
      const response = await axios.post('/api/analyze', {
        transcription: textInput
      })
      
      if (response.data.success) {
        setAnalysisData(response.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
      setIsProcessing(false)
    }
  }

  const handleFileSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    setIsProcessing(true)
    setUploadStatus('Uploading & Transcribing...')

    const formData = new FormData()
    formData.append('audio', file)
    formData.append('language', 'es')

    try {
      const transResponse = await axios.post('/api/transcribe', formData)
      
      if (transResponse.data.success) {
        const transcriptionText = transResponse.data.data.text
        setTextInput(transcriptionText)
        setUploadStatus('Analyzing patterns...')
        
        const analyzeResponse = await axios.post('/api/analyze', {
          transcription: transcriptionText
        })

        if (analyzeResponse.data.success) {
          setAnalysisData(analyzeResponse.data.data)
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
      setIsProcessing(false)
      setUploadStatus('')
    }
  }

  const loadSample = async () => {
    setLoading(true)
    setError(null)
    setIsProcessing(true)
    
    try {
      const response = await axios.get('/api/sample-analysis')
      if (response.data.success) {
        setAnalysisData(response.data.data)
      }
    } catch (err) {
      setError('Failed to load sample data')
    } finally {
      setLoading(false)
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile)
    }
  }

  return (
    <div className={`card overflow-hidden ${
      isDark ? 'card-dark' : 'card-light'
    }`}>
      {/* Tabs */}
      <div className={`flex border-b ${
        isDark ? 'border-dark-border' : 'border-light-border'
      }`}>
        <button
          onClick={() => setActiveTab('text')}
          className={`tab flex-1 flex items-center justify-center gap-2 ${
            activeTab === 'text'
              ? isDark ? 'tab-active-dark' : 'tab-active-light'
              : isDark ? 'tab-inactive-dark' : 'tab-inactive-light'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Text</span>
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`tab flex-1 flex items-center justify-center gap-2 ${
            activeTab === 'audio'
              ? isDark ? 'tab-active-dark' : 'tab-active-light'
              : isDark ? 'tab-inactive-dark' : 'tab-inactive-light'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Audio</span>
        </button>
      </div>

      <div className="p-5">
        {activeTab === 'text' ? (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-dark-muted' : 'text-light-muted'
              }`}>
                Post-Match Reflection
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className={`input-field h-40 resize-none ${
                  isDark ? 'input-dark' : 'input-light'
                }`}
                placeholder="Paste your tennis reflection here...

Example: 'No jugué bien hoy. La cancha estaba muy lenta y no pude ajustar mi juego. Necesito entrenar más mi movilidad.'"
              />
              <div className={`flex justify-between mt-2 text-xs ${
                isDark ? 'text-dark-muted' : 'text-light-muted'
              }`}>
                <span>{textInput.length} characters</span>
                <span>Spanish / English supported</span>
              </div>
            </div>
            
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing}
              className={`w-full flex items-center justify-center gap-2 ${
                isDark ? 'btn-primary-dark' : 'btn-primary-light'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Analyze Patterns</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleFileSubmit} className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDark 
                  ? 'border-dark-border hover:border-accent-yellow/50 hover:bg-accent-yellow/5' 
                  : 'border-light-border hover:border-accent-green/50 hover:bg-accent-green/5'
              }`}
            >
              <input
                type="file"
                id="audio-upload"
                accept="audio/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                isDark ? 'bg-accent-yellow/10' : 'bg-accent-green/10'
              }`}>
                <Upload className={`w-6 h-6 ${
                  isDark ? 'text-accent-yellow' : 'text-accent-green'
                }`} />
              </div>
              <p className={`font-medium ${
                isDark ? 'text-dark-text' : 'text-light-text'
              }`}>
                {file ? file.name : 'Drop audio file here'}
              </p>
              <p className={`text-xs mt-2 ${
                isDark ? 'text-dark-muted' : 'text-light-muted'
              }`}>
                {file 
                  ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                  : 'MP3, WAV, M4A • Max 50MB'
                }
              </p>
            </div>
            
            <button
              type="submit"
              disabled={!file || isProcessing}
              className={`w-full flex items-center justify-center gap-2 ${
                isDark ? 'btn-primary-dark' : 'btn-primary-light'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadStatus || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Transcribe & Analyze</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className={`absolute inset-0 flex items-center`}>
            <div className={`w-full border-t ${
              isDark ? 'border-dark-border' : 'border-light-border'
            }`}></div>
          </div>
          <div className="relative flex justify-center">
            <span className={`px-3 text-xs ${
              isDark ? 'bg-dark-card text-dark-muted' : 'bg-light-card text-light-muted'
            }`}>
              or try a demo
            </span>
          </div>
        </div>

        {/* Sample Data Button */}
        <button
          onClick={loadSample}
          disabled={isProcessing}
          className={`w-full flex items-center justify-center gap-2 btn-secondary ${
            isDark ? 'btn-secondary-dark' : 'btn-secondary-light'
          } disabled:opacity-50`}
        >
          <Database className="w-4 h-4" />
          <span>Load Sample Analysis</span>
        </button>
        <p className={`text-xs text-center mt-2 ${
          isDark ? 'text-dark-muted' : 'text-light-muted'
        }`}>
          Test the UI without using API tokens
        </p>
      </div>
    </div>
  )
}