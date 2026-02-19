import React, { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import Header from './components/Header'
import InputSection from './components/InputSection'
import EventLog from './components/EventLog'
import ResultsDashboard from './components/ResultsDashboard'
import Toast from './components/Toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

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
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    const socket = io(API_BASE, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join-run', rid)
      addEvent({ type: 'STEP', message: 'Connected to agent — live events streaming...', ts: new Date().toISOString() })
    })

    socket.on('agent-event', (event) => {
      addEvent(event)
    })

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

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })
  }, [addEvent, showToast])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.repoUrl || !formData.teamName || !formData.leaderName) {
      showToast('Please fill in all fields', 'error')
      return
    }

    setIsRunning(true)
    setEvents([])
    setResult(null)
    setError(null)
    setCurrentIteration(null)

    addEvent({ type: 'START', message: 'Initializing CI/CD Healing Agent...', ts: new Date().toISOString() })

    try {
      // Try socket-based mode first
      const response = await axios.post(`${API_BASE}/run-agent`, formData)
      const { runId: rid } = response.data
      setRunId(rid)
      connectSocket(rid)
    } catch (err) {
      // Fallback to sync mode if socket setup fails
      addEvent({ type: 'STEP', message: 'Using synchronous mode...', ts: new Date().toISOString() })
      try {
        const syncResp = await axios.post(`${API_BASE}/run-agent-sync`, formData, { timeout: 300000 })
        const { result: syncResult, events: syncEvents } = syncResp.data
        syncEvents?.forEach(addEvent)
        setResult(syncResult)
        setIsRunning(false)
        showToast('Agent completed!', syncResult.finalStatus === 'PASSED' ? 'success' : 'info')
      } catch (syncErr) {
        const errMsg = syncErr.response?.data?.error || syncErr.message
        setError(errMsg)
        setIsRunning(false)
        addEvent({ type: 'ERROR', message: errMsg, ts: new Date().toISOString() })
        showToast('Error: ' + errMsg, 'error')
      }
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
    <div className="app-container">
      {/* Animated background */}
      <div className="bg-animated">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-grid" />

      <Header />

      <main className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Input + Event Log section */}
          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem' }}>
            {!result && (
              <InputSection
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isRunning={isRunning}
                currentIteration={currentIteration}
              />
            )}
            {(isRunning || events.length > 0) && !result && (
              <EventLog events={events} isRunning={isRunning} currentIteration={currentIteration} />
            )}
          </div>

          {/* Results Dashboard */}
          {result && (
            <ResultsDashboard
              result={result}
              onReset={handleReset}
              events={events}
            />
          )}

          {/* Error state */}
          {error && !result && (
            <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
              <div className="card-title" style={{ color: 'var(--accent-red)', marginBottom: '0.75rem' }}>
                <span>⚠️</span> Agent Error
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{error}</p>
              <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={handleReset}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default App
