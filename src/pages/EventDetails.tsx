import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { fetchEventMedia, uploadEventMedia, deleteEventMedia, fetchUserInfo, fetchUserByEmail, addUserToEvent, fetchEventUsers, removeUserFromEvent, fetchEventComments, addEventComment, deleteEventComment } from '../lib/eventService'
import type { Event, EventMedia, EventComment } from '../types/Event'
import type { UserInfo } from '../lib/eventService'

interface EventDetailsProps {
  event: Event
  onBack: () => void
  isProtected?: boolean
}

export function EventDetails({ event, onBack, isProtected = true }: EventDetailsProps) {
  const { session } = useAuth()
  const [media, setMedia] = useState<EventMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [creatorName, setCreatorName] = useState<string>('')
  const [eventUsers, setEventUsers] = useState<UserInfo[]>([])
  const [userEmail, setUserEmail] = useState('')
  const [addingUser, setAddingUser] = useState(false)
  const [creatorEmail, setCreatorEmail] = useState<string>('')
  const [comments, setComments] = useState<EventComment[]>([])
  const [commentText, setCommentText] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [commentUserNames, setCommentUserNames] = useState<Record<string, string>>({})

  useEffect(() => {
    loadMedia()
    loadCreatorInfo()
    loadComments()
    if (isProtected) {
      loadEventUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.event_id, isProtected])

  const loadCreatorInfo = async () => {
    try {
      const userInfo = await fetchUserInfo(event.create_by)
      if (userInfo) {
        const fullName = [userInfo.first_nm, userInfo.middle_nm, userInfo.last_nm]
          .filter(Boolean)
          .join(' ')
        setCreatorName(fullName || userInfo.email_txt)
        setCreatorEmail(userInfo.email_txt)
      }
    } catch (err) {
      console.error('Failed to load creator info:', err)
    }
  }

  const loadMedia = async () => {
    try {
      setLoading(true)
      const mediaData = await fetchEventMedia(event.event_id)
      setMedia(mediaData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (!session?.user.id || selectedFiles.length === 0) return

    try {
      setUploading(true)
      setError('')
      const nextSeqNbr = Math.max(...media.map(m => m.display_seq_nbr), 0) + 1

      for (let i = 0; i < selectedFiles.length; i++) {
        const newMedia = await uploadEventMedia(
          event.event_id,
          selectedFiles[i],
          session.user.id,
          nextSeqNbr + i
        )
        setMedia([...media, newMedia])
      }
      setSelectedFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload media')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!session?.user.id) return
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      await deleteEventMedia(mediaId, session.user.id)
      setMedia(media.filter(m => m.event_media_id !== mediaId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media')
    }
  }

  const loadEventUsers = async () => {
    try {
      const users = await fetchEventUsers(event.event_id)
      setEventUsers(users)
    } catch (err) {
      console.error('Failed to load event users:', err)
    }
  }

  const handleAddUser = async () => {
    if (!session?.user.id || !userEmail.trim()) return

    try {
      setAddingUser(true)
      setError('')

      const trimmedEmail = userEmail.trim()

      // Check if the email matches the event creator's email
      if (trimmedEmail.toLowerCase() === creatorEmail.toLowerCase()) {
        setError('You cannot add yourself to the event')
        setAddingUser(false)
        return
      }

      const user = await fetchUserByEmail(trimmedEmail)
      if (!user) {
        setError('User with this email not found')
        return
      }

      await addUserToEvent(event.event_id, user.user_id, session.user.id)
      setEventUsers([...eventUsers, user])
      setUserEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user')
    } finally {
      setAddingUser(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!session?.user.id) return
    if (!confirm('Are you sure you want to remove this user?')) return

    try {
      await removeUserFromEvent(event.event_id, userId, session.user.id)
      setEventUsers(eventUsers.filter(u => u.user_id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user')
    }
  }

  const loadComments = async () => {
    try {
      const eventComments = await fetchEventComments(event.event_id)
      setComments(eventComments)

      // Fetch user names for all comments
      const userNames: Record<string, string> = {}
      for (const comment of eventComments) {
        if (!userNames[comment.user_id]) {
          const userInfo = await fetchUserInfo(comment.user_id)
          if (userInfo) {
            userNames[comment.user_id] = [userInfo.first_nm, userInfo.middle_nm, userInfo.last_nm]
              .filter(Boolean)
              .join(' ')
          }
        }
      }
      setCommentUserNames(userNames)
    } catch (err) {
      console.error('Failed to load comments:', err)
    }
  }

  const handlePostComment = async () => {
    if (!session?.user.id || !commentText.trim()) return

    try {
      setPostingComment(true)
      setError('')

      const newComment = await addEventComment(event.event_id, session.user.id, commentText.trim())
      setComments([...comments, newComment])

      // Fetch the user name for the new comment
      const userInfo = await fetchUserInfo(session.user.id)
      if (userInfo) {
        const userName = [userInfo.first_nm, userInfo.middle_nm, userInfo.last_nm]
          .filter(Boolean)
          .join(' ')
        setCommentUserNames({
          ...commentUserNames,
          [session.user.id]: userName,
        })
      }

      setCommentText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setPostingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!session?.user.id) return
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await deleteEventComment(commentId, session.user.id)
      setComments(comments.filter(c => c.event_comment_id !== commentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
    }
  }

  const isOwner = event.user_id === session?.user.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 p-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          ← Back to Events
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">{event.event_name || 'Event Details'}</h1>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <p><strong>Status:</strong> {event.event_status_cd}</p>
            <p><strong>Visibility:</strong> {event.is_public ? '🌍 Public' : '🔒 Private'}</p>
            <p><strong>Start Date:</strong> {new Date(event.effective_from_tstmp).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(event.valid_upto_tstmp).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {event.location || 'Not specified'}</p>
            <p><strong>Created by:</strong> {creatorName || 'Loading...'}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isProtected && isOwner && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Add Users</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter user email"
                  className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleAddUser}
                  disabled={addingUser || !userEmail.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  {addingUser ? 'Adding...' : 'Add User'}
                </button>
              </div>
              {eventUsers.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Event Members:</h3>
                  <div className="space-y-2">
                    {eventUsers.map((user) => (
                      <div key={user.user_id} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                        <div>
                          <p className="font-semibold text-blue-900">
                            {[user.first_nm, user.middle_nm, user.last_nm].filter(Boolean).join(' ')}
                          </p>
                          <p className="text-sm text-gray-600">{user.email_txt}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(user.user_id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isProtected && isOwner && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Add Images</h2>
            <div className="space-y-4">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFiles.length > 0 && (
                <div className="text-sm text-gray-600">
                  {selectedFiles.length} file(s) selected
                </div>
              )}
              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                {uploading ? 'Uploading...' : 'Upload Images'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">📷 Event Media</h2>
          {loading ? (
            <p className="text-gray-600">Loading media...</p>
          ) : media.length === 0 ? (
            <p className="text-gray-600">No images yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.map((m) => (
                <div key={m.event_media_id} className="relative group">
                  <img
                    src={m.location_path}
                    alt="Event media"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteMedia(m.event_media_id)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Comments</h2>

          {session?.user.id && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                rows={3}
              />
              <button
                onClick={handlePostComment}
                disabled={postingComment || !commentText.trim()}
                className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                {postingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-gray-600">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.event_comment_id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-blue-900">
                        {commentUserNames[comment.user_id] || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.create_tstmp).toLocaleDateString()} {new Date(comment.create_tstmp).toLocaleTimeString()}
                      </p>
                    </div>
                    {session?.user.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.event_comment_id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.comment_txt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

