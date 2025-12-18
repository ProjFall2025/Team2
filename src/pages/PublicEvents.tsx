import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPublicEvents } from '../lib/eventService'
import { EventDetails } from './EventDetails'
import type { Event } from '../types/Event'

interface EventCardProps {
  event: Event
  onSelectEvent: (event: Event) => void
}

function EventCard({ event, onSelectEvent }: EventCardProps) {
  return (
    <div
      onClick={() => onSelectEvent(event)}
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition cursor-pointer border border-blue-100 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-900">
              {event.event_name || 'Untitled Event'}
            </h3>
            <div className="flex gap-2 mt-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Public
              </span>
            </div>
          </div>
        </div>
        {event.description_txt && (
          <p className="text-gray-700 mb-3">{event.description_txt}</p>
        )}
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            📅 {new Date(event.effective_from_tstmp).toLocaleDateString()} to{' '}
            {new Date(event.valid_upto_tstmp).toLocaleDateString()}
          </p>
          <p>⏰ Created: {new Date(event.create_tstmp).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export function PublicEvents() {
  const navigate = useNavigate()
  const [publicEvents, setPublicEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        const data = await fetchPublicEvents()
        setPublicEvents(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  if (selectedEvent) {
    return (
      <EventDetails
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
        isProtected={false}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 flex items-center justify-center">
        <div className="text-white text-3xl font-bold">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 relative overflow-hidden">
      <div className="absolute top-10 left-10 text-4xl text-blue-200 opacity-60 animate-pulse">❄️</div>
      <div className="absolute top-20 right-20 text-5xl text-cyan-200 opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}>❄️</div>
      <div className="absolute bottom-20 left-1/4 text-3xl text-blue-100 opacity-40 animate-pulse" style={{ animationDelay: '1s' }}>❄️</div>
      <div className="absolute top-1/3 right-20 text-6xl text-cyan-200 opacity-30 animate-pulse">❄️</div>

      <div className="max-w-6xl mx-auto relative z-10 p-8">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-2xl p-8 border border-blue-100">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Winter Events
            </h1>
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg hover:shadow-xl border border-cyan-300"
            >
              Login
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicEvents.length > 0 ? (
              publicEvents.map((event) => (
                <EventCard
                  key={event.event_id}
                  event={event}
                  onSelectEvent={setSelectedEvent}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No public events available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

