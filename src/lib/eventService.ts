import { supabase } from './supabase'
import type { Event, CreateEventInput, EventMedia } from '../types/Event'

export interface UserInfo {
  user_id: string
  first_nm: string
  last_nm: string
  middle_nm?: string
  email_txt: string
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function fetchPublicEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('event')
    .select('*')
    .eq('is_active_in', true)
    .eq('is_public', true)
    .order('effective_from_tstmp', { ascending: true })

  if (error) throw error
  return data || []
}

export async function fetchUserEvents(userId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('event')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active_in', true)
    .order('effective_from_tstmp', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createEvent(
  userId: string,
  eventData: CreateEventInput
): Promise<Event> {
  const eventId = generateUUID()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('event')
    .insert({
      event_id: eventId,
      user_id: userId,
      event_name: eventData.event_name,
      event_status_cd: eventData.event_status_cd,
      description_txt: eventData.description_txt,
      effective_from_tstmp: eventData.effective_from_tstmp,
      valid_upto_tstmp: eventData.valid_upto_tstmp,
      location: eventData.location,
      is_public: eventData.is_public || false,
      is_active_in: true,
      create_tstmp: now,
      create_by: userId,
      update_tstmp: now,
      update_by: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteEvent(eventId: string, userId: string): Promise<void> {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('event')
    .update({
      is_active_in: false,
      archive_tstmp: now,
      update_tstmp: now,
      update_by: userId,
    })
    .eq('event_id', eventId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function updateEvent(
  eventId: string,
  userId: string,
  eventData: Partial<CreateEventInput>
): Promise<Event> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('event')
    .update({
      ...eventData,
      update_tstmp: now,
      update_by: userId,
    })
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchEventMedia(eventId: string): Promise<EventMedia[]> {
  const { data, error } = await supabase
    .from('event_media')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_active_in', true)
    .order('display_seq_nbr', { ascending: true })

  if (error) throw error
  return data || []
}

export async function uploadEventMedia(
  eventId: string,
  file: File,
  userId: string,
  displaySeqNbr: number
): Promise<EventMedia> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${eventId}/${Date.now()}.${fileExt}`
  const mediaTypeCd = file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO'

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('event_media')
    .upload(fileName, file)

  if (uploadError) {
    throw uploadError
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('event_media')
    .getPublicUrl(fileName)

  const now = new Date().toISOString()
  const mediaId = generateUUID()

  // Insert media record into event_media table for mapping
  const { data, error } = await supabase
    .from('event_media')
    .insert({
      event_media_id: mediaId,
      event_id: eventId,
      display_seq_nbr: displaySeqNbr,
      media_type_cd: mediaTypeCd,
      location_path: publicUrlData.publicUrl,
      is_active_in: true,
      create_tstmp: now,
      create_by: userId,
      update_tstmp: now,
      update_by: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteEventMedia(
  mediaId: string,
  userId: string
): Promise<void> {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('event_media')
    .update({
      is_active_in: false,
      update_tstmp: now,
      update_by: userId,
    })
    .eq('event_media_id', mediaId)

  if (error) throw error
}

export async function fetchUserInfo(userId: string): Promise<UserInfo | null> {
  const { data, error } = await supabase
    .from('user')
    .select('user_id, first_nm, last_nm, middle_nm, email_txt')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch user info:', error)
    return null
  }
  return data
}

export async function fetchUserByEmail(email: string): Promise<UserInfo | null> {
  const { data, error } = await supabase
    .from('user')
    .select('user_id, first_nm, last_nm, middle_nm, email_txt')
    .eq('email_txt', email)
    .single()

  if (error) {
    console.error('Failed to fetch user by email:', error)
    return null
  }
  return data
}

export async function addUserToEvent(
  eventId: string,
  userId: string,
  addedByUserId: string
): Promise<void> {
  const eventUserId = generateUUID()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('event_user_map')
    .insert({
      event_user_id: eventUserId,
      event_id: eventId,
      user_id: userId,
      added_by_user_id: addedByUserId,
      added_tstmp: now,
      is_delete_in: false,
      is_active_in: true,
      create_tstmp: now,
      create_by: addedByUserId,
      update_tstmp: now,
      update_by: addedByUserId,
    })

  if (error) throw error
}

export async function fetchEventUsers(eventId: string): Promise<UserInfo[]> {
  const { data, error } = await supabase
    .from('event_user_map')
    .select('user_id')
    .eq('event_id', eventId)
    .eq('is_active_in', true)
    .eq('is_delete_in', false)

  if (error) throw error

  const userIds = data?.map(d => d.user_id) || []
  if (userIds.length === 0) return []

  const { data: users, error: usersError } = await supabase
    .from('user')
    .select('user_id, first_nm, last_nm, middle_nm, email_txt')
    .in('user_id', userIds)

  if (usersError) throw usersError
  return users || []
}

export async function removeUserFromEvent(
  eventId: string,
  userId: string,
  removedByUserId: string
): Promise<void> {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('event_user_map')
    .update({
      is_delete_in: true,
      delete_tstmp: now,
      update_tstmp: now,
      update_by: removedByUserId,
    })
    .eq('event_id', eventId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function fetchJoinedEvents(userId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('event_user_map')
    .select('event_id')
    .eq('user_id', userId)
    .eq('is_active_in', true)
    .eq('is_delete_in', false)

  if (error) throw error

  const eventIds = data?.map(d => d.event_id) || []
  if (eventIds.length === 0) return []

  const { data: events, error: eventsError } = await supabase
    .from('event')
    .select('*')
    .in('event_id', eventIds)
    .eq('is_active_in', true)
    .order('effective_from_tstmp', { ascending: true })

  if (eventsError) throw eventsError
  return events || []
}

export interface EventComment {
  event_comment_id: string
  event_id: string
  user_id: string
  display_seq_nbr: number
  comment_txt: string
  is_active_in: boolean
  create_tstmp: string
  create_by: string
  update_tstmp: string
  update_by: string
}

export async function fetchEventComments(eventId: string): Promise<EventComment[]> {
  const { data, error } = await supabase
    .from('event_comment')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_active_in', true)
    .order('display_seq_nbr', { ascending: true })

  if (error) throw error
  return data || []
}

export async function addEventComment(
  eventId: string,
  userId: string,
  commentText: string
): Promise<EventComment> {
  const commentId = generateUUID()
  const now = new Date().toISOString()

  // Get the max display_seq_nbr for this event
  const { data: existingComments } = await supabase
    .from('event_comment')
    .select('display_seq_nbr')
    .eq('event_id', eventId)
    .order('display_seq_nbr', { ascending: false })
    .limit(1)

  const nextSeqNbr = (existingComments?.[0]?.display_seq_nbr || 0) + 1

  const { data, error } = await supabase
    .from('event_comment')
    .insert({
      event_comment_id: commentId,
      event_id: eventId,
      user_id: userId,
      display_seq_nbr: nextSeqNbr,
      comment_txt: commentText,
      is_active_in: true,
      create_tstmp: now,
      create_by: userId,
      update_tstmp: now,
      update_by: userId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteEventComment(
  commentId: string,
  userId: string
): Promise<void> {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('event_comment')
    .update({
      is_active_in: false,
      update_tstmp: now,
      update_by: userId,
    })
    .eq('event_comment_id', commentId)

  if (error) throw error
}
