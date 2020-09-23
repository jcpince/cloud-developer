import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteItem } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId: string = event.pathParameters.todoId

  // TODO: Remove a TODO item by id
  var statusCode = 200
  const userId = getUserId(event)
  try {
    await deleteItem(userId, todoId)
  }
  catch (e) {
    console.error(`TodoItem ${todoId} deletion failed:`, e.message)
    statusCode = 401
  }
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ""
  }
}
