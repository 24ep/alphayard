'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  reconnect: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setConnected(false)
      }
      return
    }

    // Connect to socket server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
    const newSocket = io(socketUrl, {
      auth: {
        token: localStorage.getItem('accessToken'),
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Socket connected')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnected(false)
    })

    // Listen for real-time updates
    newSocket.on('Circle:update', (data) => {
      console.log('Circle update:', data)
      // Emit custom event for components to listen
      window.dispatchEvent(new CustomEvent('Circle:update', { detail: data }))
    })

    newSocket.on('social:new_post', (data) => {
      console.log('New post:', data)
      window.dispatchEvent(new CustomEvent('social:new_post', { detail: data }))
    })

    newSocket.on('chat:new_message', (data) => {
      console.log('New message:', data)
      window.dispatchEvent(new CustomEvent('chat:new_message', { detail: data }))
    })

    newSocket.on('task:update', (data) => {
      console.log('Task update:', data)
      window.dispatchEvent(new CustomEvent('task:update', { detail: data }))
    })

    return () => {
      newSocket.disconnect()
      socketRef.current = null
      setSocket(null)
      setConnected(false)
    }
  }, [isAuthenticated, user])

  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current.connect()
    }
  }

  const value: SocketContextType = {
    socket,
    connected,
    reconnect,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}


