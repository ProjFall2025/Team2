import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { CreateEventModal } from '../components/CreateEventModal'
import {
  fetchPublicEvents,
  fetchUserEvents,
  fetchJoinedEvents,
  createEvent,
  deleteEvent,
  updateEvent,
} from '../lib/eventService'
import type { Event, CreateEventInput } from '../types/Event'

interface EventsProps {
  onSelectEvent: (event: Event) => void
}

export function Events({ onSelectEvent }: EventsProps) {
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
  const [publicEvents, setPublicEvents] = useState<Event[]>([])
  const [userEvents, setUserEvents] = useState<Event[]>([])
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'public' | 'my-events' | 'joined'>('public')

  const loadEvents = async () => {
    try {
      setLoading(true)
      const [publicData, userData, joinedData] = await Promise.all([
        fetchPublicEvents(),
        session?.user.id ? fetchUserEvents(session.user.id) : Promise.resolve([]),
        session?.user.id ? fetchJoinedEvents(session.user.id) : Promise.resolve([]),
      ])
      setPublicEvents(publicData)
      setUserEvents(userData)
      setJoinedEvents(joinedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id])

  const handleCreateEvent = async (eventData: CreateEventInput) => {
    if (!session?.user.id) return

    try {
      setIsCreating(true)
      const newEvent = await createEvent(session.user.id, eventData)
      setUserEvents([...userEvents, newEvent])
      if (eventData.event_status_cd === 'PUBLISHED') {
        setPublicEvents([...publicEvents, newEvent])
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    if (!session?.user.id) return

    try {
      await deleteEvent(eventId, session.user.id)
      setUserEvents(userEvents.filter((e) => e.event_id !== eventId))
      setPublicEvents(publicEvents.filter((e) => e.event_id !== eventId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event')
    }
  }

  const handlePublishEvent = async (eventId: string) => {
    if (!session?.user.id) return

    try {
      const eventToPublish = userEvents.find((e) => e.event_id === eventId)
      if (!eventToPublish) return

      await updateEvent(eventId, session.user.id, {
        event_status_cd: 'PUBLISHED',
      })

      // Update the event in userEvents
      const updatedUserEvents = userEvents.map((e) =>
        e.event_id === eventId ? { ...e, event_status_cd: 'PUBLISHED' } : e
      )
      setUserEvents(updatedUserEvents)

      // Also update in publicEvents if it exists there
      const updatedPublicEvents = publicEvents.map((e) =>
        e.event_id === eventId ? { ...e, event_status_cd: 'PUBLISHED' } : e
      )
      setPublicEvents(updatedPublicEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish event')
    }
  }



  const EventCard = ({ event, isOwner }: { event: Event; isOwner: boolean }) => (
    <div
      onClick={() => onSelectEvent(event)}
      className="bg-white rounded-lg p-6 border border-blue-200 shadow-md hover:shadow-lg transition cursor-pointer hover:border-cyan-400"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-blue-900">
            {event.event_name || 'Untitled Event'}
          </h3>
          <div className="flex gap-2 mt-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                event.is_public
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {event.is_public ? '🌍 Public' : '🔒 Private'}
            </span>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteEvent(event.event_id)
            }}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
          >
            🗑️
          </button>
        )}
      </div>
      {event.description_txt && (
        <p className="text-gray-700 mb-3">{event.description_txt}</p>
      )}
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          📅 {new Date(event.effective_from_tstmp).toLocaleDateString()} to{' '}
          {new Date(event.valid_upto_tstmp).toLocaleDateString()}
        </p>
        <p>👤 Created by: {event.create_by}</p>
        <p>⏰ Created: {new Date(event.create_tstmp).toLocaleDateString()}</p>
      </div>
      {isOwner && event.event_status_cd !== 'PUBLISHED' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handlePublishEvent(event.event_id)
          }}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          📢 Publish
        </button>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 flex items-center justify-center">
        <div className="text-white text-3xl font-bold flex items-center gap-3">
          <span className="animate-spin">❄️</span>
          <span>Loading events...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 p-8 relative overflow-hidden">
      <div className="absolute top-10 left-10 text-5xl text-blue-200 opacity-40 animate-pulse">
        ❄️
      </div>
      <div className="absolute top-1/3 right-20 text-6xl text-cyan-200 opacity-30 animate-pulse">
        ❄️
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-2xl p-8 border border-blue-100">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ❄️ Winter Events
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg hover:shadow-xl border border-cyan-300"
              >
                Create Event
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOut()
                    navigate('/')
                  } catch (err) {
                    console.error('Failed to sign out:', err)
                  }
                }}
                className="bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg hover:shadow-xl border border-slate-300"
              >
                Sign Out
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="flex gap-4 mb-8 border-b border-blue-200">
            <button
              onClick={() => setActiveTab('public')}
              className={`px-6 py-3 font-bold transition ${
                activeTab === 'public'
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              🌍 Public Events ({publicEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('my-events')}
              className={`px-6 py-3 font-bold transition ${
                activeTab === 'my-events'
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              📝 My Events ({userEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('joined')}
              className={`px-6 py-3 font-bold transition ${
                activeTab === 'joined'
                  ? 'text-cyan-600 border-b-2 border-cyan-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              👥 Joined Events ({joinedEvents.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'public' &&
              (publicEvents.length > 0 ? (
                publicEvents.map((event) => (
                  <EventCard
                    key={event.event_id}
                    event={event}
                    isOwner={event.user_id === session?.user.id}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">No published events yet</p>
                </div>
              ))}

            {activeTab === 'my-events' &&
              (userEvents.length > 0 ? (
                userEvents.map((event) => (
                  <EventCard
                    key={event.event_id}
                    event={event}
                    isOwner={true}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">
                    You haven't created any events yet
                  </p>
                </div>
              ))}

            {activeTab === 'joined' &&
              (joinedEvents.length > 0 ? (
                joinedEvents.map((event) => (
                  <EventCard
                    key={event.event_id}
                    event={event}
                    isOwner={false}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">
                    You haven't joined any events yet
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEvent}
        isLoading={isCreating}
      />
    </div>
  )
}

