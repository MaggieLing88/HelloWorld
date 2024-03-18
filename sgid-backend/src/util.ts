import NodeRSA from 'node-rsa'

import { ParsedSgidDataValue } from './types'



export function isNonEmptyString(value: unknown): value is string {
  if (typeof value !== 'string') return false
  if (value === '') return false
  return true
}

export function safeJsonParse(jsonString: string): ParsedSgidDataValue {
  try {
    return JSON.parse(jsonString)
  } catch (_) {
    return jsonString
  }
}
