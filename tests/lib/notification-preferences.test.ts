import { describe, it, expect } from 'vitest'
import { mapNotificationTypeToPreferenceKey } from '@lib/notification-preferences'

describe('mapNotificationTypeToPreferenceKey()', () => {
  it('deve mapear tipos conhecidos', () => {
    expect(mapNotificationTypeToPreferenceKey('workout')).toBe('workout_enabled')
    expect(mapNotificationTypeToPreferenceKey('payment')).toBe('payment_enabled')
    expect(mapNotificationTypeToPreferenceKey('subscription')).toBe('payment_enabled')
    expect(mapNotificationTypeToPreferenceKey('student')).toBe('student_enabled')
    expect(mapNotificationTypeToPreferenceKey('assessment')).toBe('assessment_enabled')
    expect(mapNotificationTypeToPreferenceKey('calendar')).toBe('calendar_enabled')
    expect(mapNotificationTypeToPreferenceKey('marketing')).toBe('marketing_enabled')
  })

  it('deve retornar null para tipo desconhecido', () => {
    expect(mapNotificationTypeToPreferenceKey('system')).toBeNull()
    expect(mapNotificationTypeToPreferenceKey('')).toBeNull()
  })
})
