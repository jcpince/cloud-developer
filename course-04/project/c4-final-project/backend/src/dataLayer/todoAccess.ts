import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'
import { S3Event } from 'aws-lambda'

const logger = createLogger('todoAccess')

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.TODOS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly table = process.env.TODOS_TABLE) {
  }

  async getAllItems(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todo items for ' + userId)

    const result = await this.docClient.query({
      TableName: this.table,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()

    logger.info('Todos for ' + userId + ' fetched')

    const items = result.Items
    return items as TodoItem[]
  }

  async createItem(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('Creating a new todo item with ' + JSON.stringify(todoItem))
    await this.docClient.put({
      TableName: this.table,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async deleteItem(userId:string, todoId: string) {
    logger.info('Deleting a todo item ' + todoId)
    await this.docClient.delete({
      TableName: this.table,
      Key: {
          "todoId": todoId,
          "userId": userId
      }
    }).promise()
  }

  async updateItem(userId:string, todoId: string, update: TodoUpdate) {
    logger.info('Updating a todo item ' + todoId + " with " + JSON.stringify(update))
    await this.docClient.update({
      TableName: this.table,
      Key: {
          "todoId": todoId,
          "userId": userId
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

  async updateDbAttachment(userId : string, todoId : string, key: string) {
    const newUrl = `https://${bucketName}.s3.amazonaws.com/${key}`
    logger.info('Updating a todo item attachment url ' + todoId + " for user " + userId + " with " + newUrl)
    await this.docClient.update({
      TableName: this.table,
      Key: {
        "todoId": todoId,
        "userId": userId
      },
      UpdateExpression: "set attachmentUrl = :n",
      ExpressionAttributeValues: {
          ":n": newUrl,
      }
    }).promise()
  }

  async updateItemAttachment(s3Event: S3Event) {
    for (const record of s3Event.Records) {
      let buff = Buffer.from(record.s3.object.key, 'base64');
      let keyascii = buff.toString('ascii');
      const todoId_userId = keyascii.split(':')
      const todoId = todoId_userId[0]
      const userId = todoId_userId[1]
      await this.updateDbAttachment(userId, todoId, record.s3.object.key)
    }
  }

  getUploadUrl(userId:string, itemId: string): string {
    const buff = Buffer.from(itemId + ':' + userId);
    const key64 = buff.toString('base64');
    logger.info('Getting a storage URL form todo item ' + itemId + " from userId " + userId + ": " + key64)

    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: key64,
        Expires: urlExpiration,
      })
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  logger.info('Creating a remote DynamoDB instance')
  return new XAWS.DynamoDB.DocumentClient()
}