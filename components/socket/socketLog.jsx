'use client'

import { useMemo } from 'react'
import { useSocket } from '@/components/socket/usesocket'

function getLevelColor(level) {
  const value = String(level || 'info').toLowerCase()
  if (value === 'error') return '#b91c1c'
  if (value === 'warn' || value === 'warning') return '#b45309'
  if (value === 'system') return '#1d4ed8'
  return '#374151'
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour12: false })
}

function normalizeMessage(msg, index) {
  if (typeof msg === 'string') {
    return {
      id: `line-${index}`,
      level: 'info',
      message: msg,
      time: ''
    }
  }

  if (msg && typeof msg === 'object') {
    if (msg.type === 'system') {
      return {
        id: `line-${index}`,
        level: 'system',
        message: msg.text || JSON.stringify(msg),
        time: formatTime(msg.timestamp)
      }
    }

    return {
      id: `line-${index}`,
      level: msg.level || 'info',
      message: typeof msg.message === 'string' ? msg.message : JSON.stringify(msg),
      time: formatTime(msg.timestamp)
    }
  }

  return {
    id: `line-${index}`,
    level: 'info',
    message: String(msg),
    time: ''
  }
}

export default function SocketDebug({ channel }) {
  const channels = useMemo(
    () => (channel ? ['global', channel] : ['global']),
    [channel]
  )
  const { messages, isConnected, error } = useSocket(channels)
  const normalizedMessages = useMemo(() => {
    const lines = messages.map((msg, index) => normalizeMessage(msg, index))
    return lines.filter((line, index) => {
      if (index === 0) return true
      const prev = lines[index - 1]
      const isDuplicateSystemJoin =
        line.level === 'system' &&
        prev.level === 'system' &&
        line.message === prev.message &&
        line.message.startsWith('Joined channel ')
      return !isDuplicateSystemJoin
    })
  }, [messages])

  return (
    <div style={{ padding: 16 }}>
      <h2>Socket Status</h2>

      <p>
        Connection:
        <strong style={{ color: isConnected ? 'green' : 'red' }}>
          {isConnected ? ' Connected' : ' Disconnected'}
        </strong>
      </p>

      <p>
        Channels:
        <strong> {channels.join(', ')}</strong>
      </p>

      {error && (
        <p style={{ color: 'red' }}>
          Error: {error}
        </p>
      )}

      <h3>Messages</h3>

      {normalizedMessages.length === 0 && <p>No messages yet</p>}

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          background: '#f9fafb',
          maxHeight: 480,
          overflowY: 'auto',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        }}
      >
        {normalizedMessages.map((entry) => (
          <div
            key={entry.id}
            style={{
              borderBottom: '1px solid #e5e7eb',
              padding: '10px 12px'
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ color: '#6b7280', minWidth: 70 }}>{entry.time || '--:--:--'}</span>
              <span
                style={{
                  color: getLevelColor(entry.level),
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: 12
                }}
              >
                {entry.level}
              </span>
            </div>
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#111827'
              }}
            >
              {entry.message}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
