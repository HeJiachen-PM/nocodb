import type { ComputedRef, Ref, ToRefs } from 'vue'
import type { WritableComputedRef } from '@vue/reactivity'
import type { JwtPayload } from 'jwt-decode'
import type { User } from '~/lib'
import type { useCounter } from '#imports'

export interface FeedbackForm {
  url: string
  createdAt: string
  isHidden: boolean
  lastFormPollDate?: string
}

export interface AppInfo {
  ncSiteUrl: string
  authType: 'jwt' | 'masterKey' | 'none'
  connectToExternalDB: boolean
  defaultLimit: number
  firstUser: boolean
  githubAuthEnabled: boolean
  googleAuthEnabled: boolean
  ncMin: boolean
  oneClick: boolean
  projectHasAdmin: boolean
  teleEnabled: boolean
  type: string
  version: string
}

export interface StoredState {
  token: string | null
  user: User | null
  lang: string
  darkMode: boolean
  feedbackForm: FeedbackForm
  filterAutoSave: boolean
  previewAs: string | null
}

export type State = ToRefs<Omit<StoredState, 'token'>> & {
  storage: Ref<StoredState>
  token: WritableComputedRef<StoredState['token']>
  jwtPayload: ComputedRef<(JwtPayload & User) | null>
  timestamp: Ref<number>
  runningRequests: ReturnType<typeof useCounter>
  error: Ref<any>
  appInfo: Ref<AppInfo>
}

export interface Getters {
  signedIn: ComputedRef<boolean>
  isLoading: WritableComputedRef<boolean>
}

export interface Actions {
  signOut: () => void
  signIn: (token: string) => void
  refreshToken: () => void
}

export type ReadonlyState = Readonly<Pick<State, 'token' | 'user'>> & Omit<State, 'token' | 'user'>

export type UseGlobalReturn = Getters & Actions & ReadonlyState
