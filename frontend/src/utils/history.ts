import { TUTORIALS } from '../data/tutorials'
import { API_BASE_URL } from '../config'

export interface HistoryEntry {
  id: string;
  time: string;       // Full date + time: "05/05/2026 14:23:05"
  gesture: string;
  icon: string;
  phrase: string;
  confidenceStr: string;
  platform: string;
  duration: string;
  status: 'high' | 'med' | 'low';
  rawConfidence: number;
}

/** Returns a user-specific localStorage key so different users don't share history. */
function getUserHistoryKey(): string {
  const token = localStorage.getItem('signetra_token')
  if (!token) return 'signetra_history_guest'
  // Use last 16 chars of token as a stable per-user identifier
  return `signetra_history_${token.slice(-16)}`
}

export function logGestureHistory(
  gesturePhrase: string,
  confidence: number,
  platform: string = 'Webcam',
  category: string = 'General'
) {
  try {
    const key = getUserHistoryKey()
    const rawData = localStorage.getItem(key)
    let history: HistoryEntry[] = rawData ? JSON.parse(rawData) : []

    const safePhrase = gesturePhrase || ''
    const tutorial = TUTORIALS.find(
      t =>
        t.title.toLowerCase() === safePhrase.toLowerCase() ||
        t.phrase.toLowerCase() === safePhrase.toLowerCase()
    )
    const icon = tutorial?.icon || 'front_hand'
    const status = confidence > 90 ? 'high' : confidence > 75 ? 'med' : 'low'

    // Store full date + time so the History page can display the date
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB') // DD/MM/YYYY
    const timeStr = now.toTimeString().split(' ')[0]  // HH:MM:SS
    const fullTime = `${dateStr} ${timeStr}`

    const finalPhrase = tutorial ? tutorial.title : gesturePhrase

    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      time: fullTime,
      gesture: finalPhrase,
      icon,
      phrase: `"${tutorial ? tutorial.phrase : gesturePhrase}"`,
      confidenceStr: `${Math.round(confidence)}%`,
      platform,
      duration: '1.2s',
      status,
      rawConfidence: confidence,
    }

    history.unshift(newEntry)

    // Raised cap to 10,000 items — well beyond what localStorage can reasonably hold
    // Backend is the true long-term store; this is just a real-time local buffer
    if (history.length > 10_000) {
      history = history.slice(0, 10_000)
    }

    localStorage.setItem(key, JSON.stringify(history))

    // Sync to backend (source of truth for multi-device / cross-session history)
    const token = localStorage.getItem('signetra_token')
    if (token) {
      fetch(`${API_BASE_URL}/api/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phrase: finalPhrase,
          confidence,
          category,
          platform,
        }),
      }).catch(err => console.warn('Failed to push history to backend', err))
    }
  } catch (err) {
    console.warn('Failed to log history', err)
  }
}

export function getLearningProgress(): number {
  try {
    const key = getUserHistoryKey()
    const rawData = localStorage.getItem(key)
    if (!rawData) return 0

    const history: HistoryEntry[] = JSON.parse(rawData)
    const uniqueGestures = new Set<string>()

    history.forEach(entry => {
      uniqueGestures.add(entry.gesture.toLowerCase())
    })

    if (TUTORIALS.length === 0) return 0

    let completedCount = 0
    TUTORIALS.forEach(tutorial => {
      if (
        uniqueGestures.has(tutorial.title.toLowerCase()) ||
        uniqueGestures.has(tutorial.phrase.toLowerCase())
      ) {
        completedCount++
      }
    })

    return Math.min(Math.round((completedCount / TUTORIALS.length) * 100), 100)
  } catch (err) {
    console.warn('Failed to calculate learning progress', err)
    return 0
  }
}
