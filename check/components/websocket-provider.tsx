"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'

interface Notification {
    type: string
    message: string
    from_user?: string
    from_id?: string
    target_class?: string
    [key: string]: any
}

interface WebSocketContextType {
    sendMessage: (msg: any) => void
    notifications: Notification[]
    clearNotifications: () => void
    isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({
    sendMessage: () => {},
    notifications: [],
    clearNotifications: () => {},
    isConnected: false
})

export const useWebSocket = () => useContext(WebSocketContext)

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoggedIn } = useAuth()
    const [isConnected, setIsConnected] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!isLoggedIn || !user) {
            if (wsRef.current) {
                wsRef.current.close()
                wsRef.current = null
            }
            return
        }

        const connect = () => {
            if (!user?.id) return

            // Avoid multiple connections
            if (wsRef.current?.readyState === WebSocket.OPEN) return

            // Use 127.0.0.1 to avoid localhost IPv4/IPv6 resolution issues on Windows
            const wsUrl = `ws://127.0.0.1:8000/api/notifications/ws/${user.id}/${user.role || 'student'}`
            console.log("[WebSocket] Connecting to:", wsUrl)
            
            const ws = new WebSocket(wsUrl)

            ws.onopen = () => {
                console.log("[WebSocket] Connected successfully")
                setIsConnected(true)
                if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    console.log("[WebSocket] Message received:", data)
                    
                    setNotifications(prev => [data, ...prev])
                    
                    if (data.type === "ACCESS_GRANTED") {
                        toast.success(data.message)
                    } else if (data.type === "ACCESS_REQUEST") {
                        toast.info(`Request: ${data.message}`)
                    }
                } catch (e) {
                    console.error("[WebSocket] Failed to parse message:", event.data)
                }
            }

            ws.onclose = (event) => {
                console.log("[WebSocket] Disconnected. Code:", event.code, "Reason:", event.reason)
                setIsConnected(false)
                wsRef.current = null
                // Reconnect logic with backoff could be better, but simple timeout for now
                reconnectTimeout.current = setTimeout(connect, 3000)
            }

            ws.onerror = (err) => {
                // Common issue: backend not running. Don't spam console too much if it's just a refesh.
                console.warn("[WebSocket] Connection Warning/Error. Backend might be down or restarting.")
                ws.close()
            }

            wsRef.current = ws
        }

        connect()

        return () => {
            if (wsRef.current) {
               wsRef.current.close()
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current)
            }
        }
    }, [user, isLoggedIn])

    const sendMessage = (msg: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg))
        } else {
            console.warn("WebSocket not connected, cannot send:", msg)
            toast.error("Connection lost. Trying to reconnect...")
        }
    }

    const clearNotifications = () => {
        setNotifications([])
    }

    return (
        <WebSocketContext.Provider value={{ sendMessage, notifications, clearNotifications, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    )
}
