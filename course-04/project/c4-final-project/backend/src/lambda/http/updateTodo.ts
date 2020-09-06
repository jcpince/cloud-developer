import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { todoAccess } from '../../dataLayer/todoAccess'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  var statusCode = 200
  var body = ""
  try {
    const item = await todoAccess.updateItem(todoId, updatedTodo)
    body = JSON.stringify({
      item
    })
  }
  catch(e) {
    console.error(`Cannot update TodoItem ${todoId}: `, e.message)
    statusCode = 400
  }
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: body
  }
}
