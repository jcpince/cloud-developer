// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
//const apiId = 'xm2j3w47xb'
//export const apiEndpoint = `https://${apiId}.execute-api.eu-west-3.amazonaws.com/dev`

const apiId = 'j10vg1dsfh'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`


export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-sey0m6-p.eu.auth0.com',            // Auth0 domain
  clientId: 'yUrorMucS4EaMC9SRtOUlwO6nImJ22lD',   // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
