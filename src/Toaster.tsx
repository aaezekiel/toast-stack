'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { subscribe, removeToast, type ToastData } from './store'
import './styles.css'

const MAX_VISIBLE = 3
const PEEK = 8
const SCALE_STEP = 0.05
const GAP = 10
const RING_R = 7
const RING_C = Math.round(2 * Math.PI * RING_R)

const ICONS: Partial<Record<string, React.ReactNode>> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#16a34a"/>
      <path d="M5 8.5l2 2 4-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#dc2626"/>
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#d97706"/>
      <path d="M8 5v3.5M8 10.5v.01" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#2563eb"/>
      <path d="M8 5.5v.01M8 7.5v3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

const RING_COLORS: Record<string, string> = {
  success: '#16a34a',
  error: '#dc2626',
  warning: '#d97706',
  info: '#2563eb',
  default: 'rgba(255,255,255,0.4)',
}

// ── Toast item ────────────────────────────────────────────────────────────────

interface ItemProps {
  data: ToastData
  stackTransform: string
  zIndex: number
  isEntering: boolean
  onHeight: (h: number) => void
  onDismiss: () => void
}

function Item({ data, stackTransform, zIndex, isEntering, onHeight, onDismiss }: ItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (ref.current) onHeight(ref.current.offsetHeight)
  })

  useEffect(() => {
    if (data.duration === Infinity) return
    timerRef.current = setTimeout(dismiss, data.duration)
    return () => clearTimeout(timerRef.current)
  }, [data.id])

  function dismiss() {
    clearTimeout(timerRef.current)
    setLeaving(true)
    setTimeout(onDismiss, 280)
  }

  const icon = ICONS[data.type]
  const ringColor = RING_COLORS[data.type] ?? RING_COLORS.default

  return (
    <div
      ref={ref}
      className={`ts-wrapper${isEntering ? ' ts-entering' : ''}${leaving ? ' ts-leaving' : ''}`}
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        transform: leaving ? undefined : stackTransform,
        zIndex,
      }}
    >
      <div className="ts-toast">
        {icon && <span className="ts-icon">{icon}</span>}
        <span className="ts-content">
          <span className="ts-msg">{data.message}</span>
          {data.description && <span className="ts-desc">{data.description}</span>}
        </span>
        {data.action && (
          <button className="ts-action-btn" onClick={() => { data.action!.onClick(); dismiss() }}>
            {data.action.label}
          </button>
        )}
        {data.cancel && (
          <button className="ts-cancel-btn" onClick={() => { data.cancel!.onClick(); dismiss() }}>
            {data.cancel.label}
          </button>
        )}
        <svg className="ts-ring" width="18" height="18" viewBox="0 0 18 18">
          <circle cx="9" cy="9" r={RING_R} fill="none" strokeWidth="1.5" stroke="rgba(255,255,255,0.08)"/>
          <circle
            cx="9" cy="9" r={RING_R} fill="none"
            stroke={ringColor} strokeWidth="1.5" strokeLinecap="round"
            strokeDasharray={RING_C}
            style={data.duration !== Infinity
              ? { animation: `ts-ring-drain ${data.duration}ms linear forwards` }
              : undefined}
          />
        </svg>
        <button className="ts-close" onClick={dismiss} aria-label="Dismiss">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Toaster ───────────────────────────────────────────────────────────────────

export interface ToasterProps {
  position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'
}

export function Toaster({ position = 'bottom-center' }: ToasterProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [hovered, setHovered] = useState(false)
  const [heights, setHeights] = useState<Record<string, number>>({})
  const enterSet = useRef(new Set<string>())
  const knownIds = useRef(new Set<string>())

  useEffect(() => {
    return subscribe(next => {
      next.forEach(t => {
        if (!knownIds.current.has(t.id)) {
          knownIds.current.add(t.id)
          enterSet.current.add(t.id)
          setTimeout(() => {
            enterSet.current.delete(t.id)
            setToasts(prev => [...prev])
          }, 50)
        }
      })
      setToasts(next)
    })
  }, [])

  const handleHeight = useCallback((id: string, h: number) => {
    setHeights(prev => prev[id] === h ? prev : { ...prev, [id]: h })
  }, [])

  const visible = toasts.slice(0, MAX_VISIBLE)
  const frontH = heights[visible[0]?.id] ?? 60

  const containerH = hovered
    ? visible.reduce((acc, t) => acc + (heights[t.id] ?? 60) + GAP, 0) - GAP
    : frontH + Math.max(0, visible.length - 1) * PEEK

  const posStyle: React.CSSProperties =
    position === 'bottom-center' ? { bottom: 24, left: '50%', transform: 'translateX(-50%)' } :
    position === 'bottom-right'  ? { bottom: 24, right: 24 } :
    position === 'bottom-left'   ? { bottom: 24, left: 24 } :
    position === 'top-center'    ? { top: 24, left: '50%', transform: 'translateX(-50%)' } :
    position === 'top-right'     ? { top: 24, right: 24 } :
                                   { top: 24, left: 24 }

  return (
    <div
      className="ts-container"
      style={{ ...posStyle, height: containerH }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {visible.map((t, i) => {
        const stackTransform = hovered
          ? `translateY(-${visible.slice(0, i).reduce((acc, item) => acc + (heights[item.id] ?? 60) + GAP, 0)}px) scale(1)`
          : `translateY(-${PEEK * i}px) scale(${1 - SCALE_STEP * i})`

        return (
          <Item
            key={t.id}
            data={t}
            stackTransform={stackTransform}
            zIndex={MAX_VISIBLE - i}
            isEntering={enterSet.current.has(t.id)}
            onHeight={(h) => handleHeight(t.id, h)}
            onDismiss={() => removeToast(t.id)}
          />
        )
      })}
    </div>
  )
}
