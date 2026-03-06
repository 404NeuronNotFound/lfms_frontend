export interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile: {
    phone_number?: string
    address?: string
    bio?: string
     avatar?: string
  }
  role: string
  date_joined: string
  notifications_email: boolean
  notifications_push: boolean
  notifications_sms: boolean
  two_factor_enabled: boolean
}


export interface UpdateProfilePayload {
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  bio?: string
}

export interface UpdateProfileResponse {
  message: string
  user: UserProfile
}


export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  confirm_new_password: string
}

export interface ChangePasswordResponse {
  message: string
}


export interface NotificationPrefsPayload {
  notifications_email: boolean
  notifications_push: boolean
  notifications_sms: boolean
}


export interface DeleteAccountPayload {
  password: string
}