export interface Event {
  event_id: string
  user_id: string
  event_name: string
  event_type_cd: string
  event_status_cd: string
  description_txt?: string
  effective_from_tstmp: string
  valid_upto_tstmp: string
  archive_tstmp?: string
  is_active_in: boolean
  create_tstmp: string
  create_by: string
  update_tstmp: string
  update_by: string
  location?: string
  is_public?: boolean
}

export interface CreateEventInput {
  event_name: string
  event_type_cd?: string
  event_status_cd: string
  description_txt?: string
  effective_from_tstmp: string
  valid_upto_tstmp: string
  location?: string
  max_attendees?: number
  is_public?: boolean
}

export type EventStatusCode = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'ARCHIVED'

export interface EventMedia {
  event_media_id: string
  event_id: string
  display_seq_nbr: number
  media_type_cd: string
  location_path: string
  is_active_in: boolean
  create_tstmp: string
  create_by: string
  update_tstmp: string
  update_by: string
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
