import { TUTORIALS } from '../data/tutorials'
import { API_BASE_URL } from '../config'

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

export function logGestureHistory(gesturePhrase: string, confidence: number, platform: string = 'Webcam', category: string = 'General') {
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
    
    const finalPhrase = tutorial ? tutorial.title : gesturePhrase;

    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      time: timeStr,
      gesture: finalPhrase,
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

    // ALSO sync to backend for global stats dashboard
    const token = localStorage.getItem('signetra_token');
    if (token) {
        fetch(`${API_BASE_URL}/api/history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                phrase: finalPhrase,
                confidence: confidence,
                category: category,
                platform: platform
            })
        }).catch(err => console.warn("Failed to push history to backend", err));
    }

  } catch (err) {
    console.warn("Failed to log history", err)
  }
}

export function getLearningProgress(): number {
  try {
    const rawData = localStorage.getItem('signetra_history')
    if (!rawData) return 0
    
    const history: HistoryEntry[] = JSON.parse(rawData)
    const uniqueGestures = new Set<string>()
    
    // Collect all unique gestures the user has successfully performed
    history.forEach(entry => {
      // Normalize to handle case differences
      uniqueGestures.add(entry.gesture.toLowerCase())
    })
    
    if (TUTORIALS.length === 0) return 0
    
    // Count how many tutorials have been completed
    let completedCount = 0
    TUTORIALS.forEach(tutorial => {
      if (uniqueGestures.has(tutorial.title.toLowerCase()) || uniqueGestures.has(tutorial.phrase.toLowerCase())) {
        completedCount++
      }
    })
    
    const percentage = Math.round((completedCount / TUTORIALS.length) * 100)
    return Math.min(percentage, 100) // Cap at 100%
  } catch (err) {
    console.warn("Failed to calculate learning progress", err)
    return 0
  }
}
