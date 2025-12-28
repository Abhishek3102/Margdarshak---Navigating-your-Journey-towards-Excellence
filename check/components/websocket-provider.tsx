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
    removeNotification: (index: number) => void
    isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({
    sendMessage: () => {},
    notifications: [],
    clearNotifications: () => {},
    removeNotification: () => {},
    isConnected: false
})

export const useWebSocket = () => useContext(WebSocketContext)

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoggedIn, refreshUser } = useAuth()
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

            // Dynamic WebSocket URL Construction
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"
            const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws"
            const wsHost = apiUrl.replace(/^https?:\/\//, "")
            
            // Remove '/api' from the host if present to get base domain, then append exact WS path
            // Actually, wait, the API_URL usually includes /api. 
            // If API_URL = https://render.com/api, we want wss://render.com/api/notifications/ws/...
            
            const wsUrl = `${wsProtocol}://${wsHost}/notifications/ws/${user.id}/${user.role || 'student'}`
            console.log("[WebSocket] Connecting to:", wsUrl)
            
            const ws = new WebSocket(wsUrl)

            ws.onopen = () => {
                console.log("[WebSocket] Connected successfully")
                setIsConnected(true)
                if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
            }

            ws.onmessage = (event) => {
                let data;
                try {
                    data = JSON.parse(event.data)
                } catch (e) {
                    console.error("[WebSocket] Failed to parse message:", event.data)
                    return
                }

                try {
                    console.log("[WebSocket] Message received:", data)
                    
                    // Prevent duplicate notifications
                    setNotifications(prev => {
                        const exists = prev.some(n => n.message === data.message && n.type === data.type)
                        if (exists) return prev
                        return [data, ...prev]
                    })
                    
                    if (data.type === "ACCESS_GRANTED") {
                        toast.success(data.message)
                        
                         // Force sync with server for permanent access
                         // Pass the class name to retry mechanism so it waits until data exists
                         refreshUser(data.class).catch(err => console.error("[WebSocket] refreshUser failed", err))

                    } else if (data.type === "ACCESS_REQUEST") {
                        toast.info(`Request: ${data.message}`)
                    }
                } catch (processError) {
                     console.error("[WebSocket] Error processing message:", processError)
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
    }, [user?.id, isLoggedIn])

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

    const removeNotification = (index: number) => {
        setNotifications(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <WebSocketContext.Provider value={{ sendMessage, notifications, clearNotifications, removeNotification, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    )
}
