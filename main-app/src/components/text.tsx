"use client"
// src/App.tsx
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export function GrowthMachine() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw />
    </div>
  )
}