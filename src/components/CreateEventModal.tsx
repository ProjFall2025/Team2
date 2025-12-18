import { useState } from 'react'
import type { CreateEventInput } from '../types/Event'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (eventData: CreateEventInput) => Promise<void>
  isLoading: boolean
}


function getInitialFormData(): CreateEventInput {
  return {
    event_name: '',
    event_type_cd: '',
    event_status_cd: 'DRAFT',
    description_txt: '',
    effective_from_tstmp: new Date().toISOString().split('T')[0],
    valid_upto_tstmp: new Date(Date.now() +  24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  }
}

export function CreateEventModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateEventModalProps) {
  const [formData, setFormData] = useState<CreateEventInput>(getInitialFormData)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.event_name) {
      setError('Event title is required')
      return
    }

    if (!formData.effective_from_tstmp) {
      setError('Start date is required')
      return
    }

    if (!formData.valid_upto_tstmp) {
      setError('End date is required')
      return
    }

    try {
      await onSubmit(formData)
      setFormData(getInitialFormData())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
          ❄️ Create New Event
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div>
            <label className="block text-blue-900 font-semibold mb-2 text-sm">
              Event Status *
            </label>
            <select
              value={formData.event_status_cd}
              onChange={(e) =>
                setFormData({ ...formData, event_status_cd: e.target.value as EventStatusCode })
              }
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Select event status</option>
              {CREATION_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div> */}

          <div>
            <label className="block text-blue-900 font-semibold mb-2 text-sm">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.event_name}
              onChange={(e) =>
                setFormData({ ...formData, event_name: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Winter Festival 2025"
            />
          </div>

          <div>
            <label className="block text-blue-900 font-semibold mb-2 text-sm">
              Description
            </label>
            <textarea
              value={formData.description_txt}
              onChange={(e) =>
                setFormData({ ...formData, description_txt: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Describe your event..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-900 font-semibold mb-2 text-sm">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.effective_from_tstmp}
                onChange={(e) =>
                  setFormData({ ...formData, effective_from_tstmp: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-blue-900 font-semibold mb-2 text-sm">
                End Date *
              </label>
              <input
                type="date"
                value={formData.valid_upto_tstmp}
                onChange={(e) =>
                  setFormData({ ...formData, valid_upto_tstmp: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-blue-900 font-semibold mb-2 text-sm">
              Location (optional)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Event location"
            />
          </div>

          <div>
            <label className="block text-blue-900 font-semibold mb-2 text-sm">
              Max Attendees (optional)
            </label>
            <input
              type="number"
              value={formData.max_attendees || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_attendees: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) =>
                setFormData({ ...formData, is_public: e.target.checked })
              }
              className="w-4 h-4 border-2 border-blue-300 rounded"
            />
            <label htmlFor="is_public" className="text-blue-900 font-semibold">
              Make this event public
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

