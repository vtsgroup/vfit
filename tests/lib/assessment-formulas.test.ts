import { describe, expect, it } from 'vitest'
import {
  calculateBMI,
  classifyBMI,
  calculateBodyDensity,
  calculateFatPercentage,
  calculateBMR,
  calculateIdealWeight,
  classifyFatPercentage,
  calculateWHR,
  classifyWaistRisk,
  sumSkinfolds,
} from '@lib/assessment-formulas'

describe('assessment-formulas', () => {
  it('calcula IMC corretamente', () => {
    expect(calculateBMI(80, 180)).toBeCloseTo(24.69, 2)
  })

  it('classifica IMC normal', () => {
    const result = classifyBMI(23.4)
    expect(result.classification).toBe('normal')
    expect(result.label).toBe('Normal')
  })

  it('classifica IMC obesidade grau I', () => {
    const result = classifyBMI(31.2)
    expect(result.classification).toBe('obese_1')
  })

  it('soma dobras pollock_7', () => {
    const sum = sumSkinfolds('pollock_7', {
      chest: 10,
      axillary: 8,
      triceps: 12,
      subscapular: 11,
      abdominal: 14,
      suprailiac: 9,
      thigh: 15,
    })
    expect(sum).toBe(79)
  })

  it('gera erro ao faltar dobra obrigatória', () => {
    expect(() => sumSkinfolds('pollock_3_male', { chest: 10, abdominal: 12 })).toThrow()
  })

  it('calcula densidade corporal para pollock_7 masculino', () => {
    const density = calculateBodyDensity('pollock_7', 'male', 30, {
      chest: 10,
      axillary: 8,
      triceps: 12,
      subscapular: 11,
      abdominal: 14,
      suprailiac: 9,
      thigh: 15,
    })
    expect(density).not.toBeNull()
    expect(density!).toBeGreaterThan(1.0)
    expect(density!).toBeLessThan(1.2)
  })

  it('calcula % gordura no protocolo pollock_7', () => {
    const result = calculateFatPercentage(
      'pollock_7',
      'male',
      30,
      { chest: 10, axillary: 8, triceps: 12, subscapular: 11, abdominal: 14, suprailiac: 9, thigh: 15 },
      'siri'
    )
    expect(result.fatPercentage).toBeGreaterThan(5)
    expect(result.fatPercentage).toBeLessThan(30)
    expect(result.sumOfSkinfolds).toBe(79)
  })

  it('calcula % gordura por bioimpedância direta', () => {
    const result = calculateFatPercentage('bioimpedance', 'female', 28, {}, 'siri', 24.3)
    expect(result.fatPercentage).toBe(24.3)
    expect(result.densityFormula).toBe('direct')
  })

  it('calcula TMB Mifflin-St Jeor', () => {
    expect(calculateBMR(80, 180, 30, 'male')).toBe(1780)
    expect(calculateBMR(60, 165, 30, 'female')).toBe(1320)
  })

  it('calcula peso ideal (Lorentz)', () => {
    expect(calculateIdealWeight(180, 'male')).toBe(72.5)
    expect(calculateIdealWeight(165, 'female')).toBe(59)
  })

  it('classifica % gordura por sexo', () => {
    expect(classifyFatPercentage(12, 'male').classification).toBe('athlete')
    expect(classifyFatPercentage(30, 'female').classification).toBe('acceptable')
    expect(classifyFatPercentage(35, 'female').classification).toBe('obese')
  })

  it('calcula RCQ e risco de cintura', () => {
    expect(calculateWHR(82, 100)).toBe(0.82)
    expect(classifyWaistRisk(95, 'male').classification).toBe('elevated')
    expect(classifyWaistRisk(90, 'female').classification).toBe('very_elevated')
  })
})
