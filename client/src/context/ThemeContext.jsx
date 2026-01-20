import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(undefined)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, default to 'dark'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tennis-theme')
      return stored || 'dark'
    }
    return 'dark'
  })

  useEffect(() => {
    // Update body class and localStorage when theme changes
    const body = document.body
    
    if (theme === 'light') {
      body.classList.add('light')
      body.classList.remove('dark')
    } else {
      body.classList.add('dark')
      body.classList.remove('light')
    }
    
    localStorage.setItem('tennis-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
