import { describe, it, expect } from 'vitest'

describe('Utility Functions', () => {
  describe('String Utilities', () => {
    it('should get initials from name', () => {
      const getInitials = (first: string, last: string) => {
        return (first[0] + last[0]).toUpperCase()
      }
      expect(getInitials('John', 'Doe')).toBe('JD')
      expect(getInitials('Sarah', 'Johnson')).toBe('SJ')
    })

    it('should truncate long strings', () => {
      const truncate = (str: string, max: number) => {
        return str.length > max ? str.substring(0, max) + '...' : str
      }
      expect(truncate('Hello World', 5)).toBe('Hello...')
      expect(truncate('Hi', 5)).toBe('Hi')
    })
  })

  describe('Number Utilities', () => {
    it('should calculate percentage correctly', () => {
      const calculatePercentage = (value: number, total: number) => {
        return total > 0 ? (value / total) * 100 : 0
      }
      expect(calculatePercentage(75, 100)).toBe(75)
      expect(calculatePercentage(100, 0)).toBe(0)
    })
  })
})
