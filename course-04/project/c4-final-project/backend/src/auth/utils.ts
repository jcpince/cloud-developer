import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  console.log(`jwtToken: ${JSON.stringify(jwtToken)}`)
  console.log(`decodedJwt: ${JSON.stringify(decodedJwt)}`)
  return decodedJwt.sub
}
