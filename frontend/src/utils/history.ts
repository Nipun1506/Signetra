import { TUTORIALS } from '../data/tutorials'

export interface HistoryEntry {
  id: string;
  time: string;
  gesture: string;
  icon: string;
  phrase: string;
  confidenceStr: string;
  platform: string;
  duration: string;
  status: 'high' | 'med' | 'low';
  rawConfidence: number;
}

export function logGestureHistory(gesturePhrase: string, confidence: number, platform: string = 'Webcam') {
  try {
    const rawData = localStorage.getItem('signetra_history')
    let history: HistoryEntry[] = rawData ? JSON.parse(rawData) : []

    const safePhrase = gesturePhrase || ''
    const tutorial = TUTORIALS.find(t => t.title.toLowerCase() === safePhrase.toLowerCase() || t.phrase.toLowerCase() === safePhrase.toLowerCase())
    const icon = tutorial?.icon || 'front_hand'
    
    // Status visual tier
    const status = confidence > 90 ? 'high' : confidence > 75 ? 'med' : 'low'
    
    const now = new Date()
    const timeStr = now.toTimeString().split(' ')[0] // e.g., 14:23:05
    
    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      time: timeStr,
      gesture: tutorial ? tutorial.title : gesturePhrase,
      icon: icon,
      phrase: `"${tutorial ? tutorial.phrase : gesturePhrase}"`,
      confidenceStr: `${Math.round(confidence)}%`,
      platform: platform,
      duration: '1.2s', // Dummy duration representation for now
      status: status,
      rawConfidence: confidence
    }
    
    // Push format (recent first)
    history.unshift(newEntry)
    
    // Cap at 1000 items to avoid localStorage limits
    if (history.length > 1000) {
      history = history.slice(0, 1000)
    }
    
    localStorage.setItem('signetra_history', JSON.stringify(history))
  } catch (err) {
    console.warn("Failed to log history", err)
  }
}
