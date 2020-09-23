import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// DONE: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-sey0m6-p.eu.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJS/qp4lhYov8HMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1zZXkwbTYtcC5ldS5hdXRoMC5jb20wHhcNMjAwOTAxMDY1OTAwWhcN
MzQwNTExMDY1OTAwWjAkMSIwIAYDVQQDExlkZXYtc2V5MG02LXAuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvwf2ixyG+t9imdRZ
gQ+aAQUYCaMtqrACAsfBK59f/Z7rDW5zRQ/Q1c7WXOrr+FbAhwK7/L3zdI0eSvQ1
iHPYxCqho2rzINz0RUhJyy7fR4lCknK5Pl5jaRbWfncWKB+uPr39VspKgA1o3JAV
6XggWDJNjJXmIs6p4QPTQSP65Cl0/qbOgIMnEqYxcBegZH4axjiH7n19nyxBrBQV
7bcPQgUuvkHq2fdDp5G44oIpTbkeRvEL6qcOyXwp2RjMygEURxIoKAcvV3QxmpoN
GQWvldhVrblzsNg4jXg3VbbSEAQOlx/rmNCIGy51thUGMWyUnBpafYXgn0RaAm6O
Uxe94QIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS/gAks/TdW
HZgXDsDThPTJ4FEMDTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AJT0i1t9yKgfuE9QKZCTtye3Ijnxo1xhP40zsMXYSx7UktQMTefKAKj8qeSpeCdy
IGKIgCQ9CfBJOb3rcfwwgeKGmN22HZx93Be+istWE924DpxEoiUQd+z6GRloHH8I
kPSqoZoJovh79/3AP9ZyUL3A/z7Lfw2CnrjLpzNjmfMMmJ5FQxE5KgQmz54vmwp0
mbNdRCx+dxnpJgwM2OErHrEOIiWFFZ2evZ/4GiLK4i1tBYSyoMRulQQVst0I7/wu
KxkiYyUzXS0UccnvXJ6RaCMl4a9tFYaUlA/G7B1hGDI9JF9Cp+vXjK+s8/1DQgbX
xz9NKbJAFsvaQXwPdmyIl9I=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  var effect : string = 'Deny'
  var principalId : string = 'user'
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)
    effect = 'Allow'
    principalId = jwtToken.sub
  } catch (e) {
    logger.error('User not authorized', { error: e.message })
  }
  return {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: '*'
        }
      ]
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  verify(token, cert, { algorithms: ['RS256'] })
  return jwt.payload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
