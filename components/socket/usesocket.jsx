'use client'

import { useEffect, useMemo, useState } from 'react'
import io from 'socket.io-client'

export function useSocket(channelOrChannels) {
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState('')

  const channels = useMemo(() => {
    if (Array.isArray(channelOrChannels)) {
      return channelOrChannels.filter(Boolean)
    }

    return channelOrChannels ? [channelOrChannels] : []
  }, [channelOrChannels])

  const socketUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== 'undefined' ? window.location.origin : ''),
    []
  )

  useEffect(() => {
    if (!socketUrl) {
      return undefined
    }

    const socketInstance = io(
      socketUrl,
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      }
    )

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected')
      setIsConnected(true)
      setError('')
      channels.forEach((channel) => {
        socketInstance.emit('subscribe', channel)
      })
    })

    const pushMessage = (message) => {
      setMessages(prev => [...prev, message])
    }

    socketInstance.on('message', pushMessage)
    socketInstance.on('log', pushMessage)
    socketInstance.on('logs', pushMessage)
    socketInstance.on('deployment:log', pushMessage)
    socketInstance.on('build:log', pushMessage)

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', err => {
      console.error('Socket connection error:', err.message)
      setError(err.message || 'Socket connection failed')
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [channels, socketUrl])

  return {
    messages,
    isConnected,
    error: error || (!socketUrl ? 'Socket URL missing. Set NEXT_PUBLIC_SOCKET_URL.' : ''),
  }
}
