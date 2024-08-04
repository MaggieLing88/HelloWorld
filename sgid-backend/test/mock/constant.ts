import { readFileSync } from 'fs'

export const MOCK_ACCESS_TOKEN = 'mockAccessToken'
export const MOCK_AUTH_CODE = 'mockAuthCode'
export const MOCK_SUB = 'mockSub'
export const MOCK_USERINFO = {
  sub: MOCK_SUB,
  name: 'May May',
  email: 'may.may@example.com',
}
export const MOCK_CLIENT_ID = 'mockClientId'
export const MOCK_CLIENT_SECRET = 'mockClientSecret'
export const MOCK_REDIRECT_URI = 'https://sgid.com/redirect'

export const MOCK_HOSTNAME = `https://maggie.local:8443`
export const MOCK_ISSUER = `${new URL(MOCK_HOSTNAME).origin}/realms/SGID`
export const MOCK_AUTH_ENDPOINT = `${MOCK_ISSUER}/protocol/openid-connect/auth`
export const MOCK_TOKEN_ENDPOINT = `${MOCK_ISSUER}/protocol/openid-connect/token`
export const MOCK_USERINFO_ENDPOINT = `${MOCK_ISSUER}/protocol/openid-connect/userinfo`
export const MOCK_JWKS_ENDPOINT = `${MOCK_ISSUER}/protocol/openid-connect/certs`

export const MOCK_CODE_VERIFIER = 'bbGcObXZC1YGBQZZtZGQH9jsyO1vypqCGqnSU_4TI5S'
export const MOCK_CODE_CHALLENGE = 'zaqUHoBV3rnhBF2g0Gkz1qkpEZXHqi2OrPK1DqRi-Lk'

export const MOCK_PRIVATE_KEY = readFileSync(
  `${__dirname}/mockPrivateKey.pem`,
).toString()