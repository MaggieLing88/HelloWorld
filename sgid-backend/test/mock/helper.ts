import { CompactEncrypt, importJWK, importSPKI } from 'jose'
import jwt from 'jsonwebtoken'

import {
  MOCK_CLIENT_ID,
  MOCK_ISSUER,
  MOCK_PRIVATE_KEY,
  MOCK_SUB,
  MOCK_USERINFO,
} from './constant'

export const generateUserInfo = async (): Promise<Record<string, string>> => {
  const result: Record<string, string> = MOCK_USERINFO
  return result
}


export const generateIdToken = (sub = MOCK_SUB): string => {
  const secondsSinceEpoch = Math.floor(Date.now() / 1000)
  const idTokenContent = {
    iss: MOCK_ISSUER,
    sub,
    aud: MOCK_CLIENT_ID,
    exp: secondsSinceEpoch + 300,
    iat: secondsSinceEpoch,
  }
  return jwt.sign(idTokenContent, MOCK_PRIVATE_KEY, { algorithm: 'RS256' })
}

/**
 * Regex pattern that the code verifier and code challenge in the PKCE flow should match according to the PKCE RFC
 * https://www.rfc-editor.org/rfc/rfc7636
 */
export const codeVerifierAndChallengePattern = /^[A-Za-z\d\-._~]{43,128}$/
