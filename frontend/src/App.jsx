import React, { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import Header from './components/Header'
import InputSection from './components/InputSection'
import EventLog from './components/EventLog'
import ResultsDashboard from './components/ResultsDashboard'
import Toast from './components/Toast'

// Use VITE_API_URL or fallback to local
const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : 'http://localhost:4000'

function App() {
  const [formData, setFormData] = useState({ repoUrl: '', teamName: '', leaderName: '' })
  const [isRunning, setIsRunning] = useState(false)
  const [events, setEvents] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [runId, setRunId] = useState(null)
  const [currentIteration, setCurrentIteration] = useState(null)
  const socketRef = useRef(null)

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }, [])

  const addEvent = useCallback((event) => {
    setEvents(prev => [...prev, { ...event, id: Date.now() + Math.random() }])
    if (event.type === 'ITERATION') {
      setCurrentIteration({ current: event.iteration, max: event.maxIterations })
    }
  }, [])

  const connectSocket = useCallback((rid) => {
    if (socketRef.current) socketRef.current.disconnect()

    // Connect to specific run ID room
    const socket = io(API_BASE, { 
      transports: ['websocket', 'polling'],
      withCredentials: true
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      socket.emit('join-run', rid)
      addEvent({ type: 'STEP', message: 'Connected to agent — live events streaming...', ts: new Date().toISOString() })
    })

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err)
      showToast('Socket connection failed: ' + err.message, 'error')
    })

    socket.on('agent-event', (event) => addEvent(event))

    socket.on('agent-complete', ({ result }) => {
      setResult(result)
      setIsRunning(false)
      setCurrentIteration(null)
      showToast('Agent completed successfully!', result.finalStatus === 'PASSED' ? 'success' : 'error')
      socket.disconnect()
    })

    socket.on('agent-error', ({ error }) => {
      setError(error)
      setIsRunning(false)
      setCurrentIteration(null)
      showToast('Agent encountered an error: ' + error, 'error')
      socket.disconnect()
    })

  }, [addEvent, showToast])

  const handleSubmit = async (e) => {
    e.preventDefault() // Safety check
    if (!formData.repoUrl || !formData.teamName || !formData.leaderName) {
      showToast('Please fill in all fields', 'error')
      return
    }

    setIsRunning(true)
    setEvents([])
    setResult(null)
    setError(null)
    setCurrentIteration(null)

    addEvent({ type: 'START', message: 'Initializing Reparo...', ts: new Date().toISOString() })

    try {
      // 1. Start the run via POST
      const response = await axios.post(`${API_BASE}/run-agent`, formData)
      const { runId: rid } = response.data
      setRunId(rid)
      
      // 2. Connect socket to listen for events
      connectSocket(rid)
    } catch (err) {
      // If socket mode fails, fallback? Or just show error.
      // For now, let's treat it as a hard error or try fallback if you prefer.
      // But typically we want the socket stream.
      console.error(err);
      const errMsg = err.response?.data?.error || err.message
      setError(errMsg)
      setIsRunning(false)
      showToast('Error starting agent: ' + errMsg, 'error')
      addEvent({ type: 'ERROR', message: errMsg, ts: new Date().toISOString() })
    }
  }

  const handleReset = () => {
    setResult(null)
    setEvents([])
    setError(null)
    setCurrentIteration(null)
    setRunId(null)
    if (socketRef.current) socketRef.current.disconnect()
  }

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [])

  return (
    <div className="app-root">
      <Header />
      
      <main className="container">
        {/* If we have a result, show the dashboard full width */}
        {result ? (
          <div className="animate-enter">
             <button className="btn btn-primary" onClick={handleReset} style={{ marginBottom: '1rem' }}>
                &larr; Start New Run
             </button>
             <ResultsDashboard result={result} events={events} />
          </div>
        ) : (
          <div className="dashboard-grid">
            {/* Left Column: Input */}
            <div className="left-col">
              <section className="card">
                <InputSection 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  isRunning={isRunning}
                  currentIteration={currentIteration}
                />
              </section>
            </div>

            {/* Right Column: Logs */}
            <div className="right-col">
              <section className="card" style={{ height: '100%' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Live Agent Feed
                  {isRunning && <span className="status-badge"><span className="status-dot"></span> Live</span>}
                </h3>
                <EventLog events={events} />
              </section>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !result && (
           <div className="card" style={{ marginTop: '2rem', borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
              <h3 style={{ color: 'var(--danger)' }}>Agent Error</h3>
              <p>{error}</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem', background: 'var(--danger)', borderColor: 'transparent' }} onClick={handleReset}>Close</button>
           </div>
        )}

      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default App
