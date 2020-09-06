import 'source-map-support/register'

import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { todoAccess } from '../../dataLayer/todoAccess'

export const handler: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const items = await todoAccess.getAllItems()
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items
    })
  }
}