import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly table = process.env.TODOS_TABLE) {
  }

  async getAllItems(): Promise<TodoItem[]> {
    console.log('Getting all todo items')

    const result = await this.docClient.scan({
      TableName: this.table
    }).promise()

    console.log('scan done')

    const items = result.Items
    return items as TodoItem[]
  }

  async createItem(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.table,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async deleteItem(todoId: string) {
    await this.docClient.delete({
      TableName: this.table,
      Key: {
          "todoId": todoId
      }
    }).promise()
  }

  async updateItem(todoId: string, update: TodoUpdate) {
    await this.docClient.update({
      TableName: this.table,
      Key: {
          "todoId": todoId
      },
      UpdateExpression: "set #nm = :n, dueDate = :dd, done = :dn",
      ExpressionAttributeValues: {
          ":n": update.name,
          ":dd": update.dueDate,
          ":dn": update.done
      },
      ExpressionAttributeNames: {
        "#nm": "name"
      }
    }).promise()
  }
}

export const todoAccess = new TodoAccess()

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  console.log('Creating a remote DynamoDB instance')
  return new XAWS.DynamoDB.DocumentClient()
}
