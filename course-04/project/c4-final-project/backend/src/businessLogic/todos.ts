import * as uuid from 'uuid'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoAccess } from '../dataLayer/todoAccess'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { S3Event } from 'aws-lambda'

export const todoAccess = new TodoAccess()

export async function getAllItems(userId : string): Promise<TodoItem[]> {
    return todoAccess.getAllItems(userId)
}
  
export async function createItem(
    userId: string,
    createTodoRequest: CreateTodoRequest,
 ): Promise<TodoItem> {

    console.log(`Create a new todo item for user ` + userId)
    const itemId = uuid.v4()
  
    return await todoAccess.createItem({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: ""
    })
}

export async function updateItemAttachment(event: S3Event) {
    return await todoAccess.updateItemAttachment(event)
}

export async function deleteItem(userId: string, todoId: string) {
    return await todoAccess.deleteItem(userId, todoId)
}

export function getUploadUrl(userId: string, itemId: string): string {
    return todoAccess.getUploadUrl(userId, itemId)
}

export async function updateItem(userId: string, todoId: string, update: TodoUpdate) {
    return await todoAccess.updateItem(userId, todoId, update)
} 