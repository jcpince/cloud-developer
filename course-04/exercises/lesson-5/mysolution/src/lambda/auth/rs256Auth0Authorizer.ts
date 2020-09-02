import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

const cert : string = `-----BEGIN CERTIFICATE-----
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

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  var effect: string
  var principalId: string
  try {
    const decodedToken = verifyToken(
      event.authorizationToken
    )
    console.log('User was authorized', decodedToken)
    effect = 'Allow'
    principalId = decodedToken.sub
  } catch (e) {
    console.log('User was not authorized', e.message)
    effect = 'Deny'
    principalId = 'user'
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

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(
      token,           // Token from an HTTP header to validate
      cert,            // A certificate copied from Auth0 website
      { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtToken
}
