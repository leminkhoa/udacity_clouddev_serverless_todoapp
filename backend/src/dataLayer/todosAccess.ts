import * as AWS           from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger }   from '../utils/logger'
import { TodoItem }       from '../models/TodoItem'
import { TodoUpdate }     from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess{
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly thumbnailsBucket = process.env.THUMBNAILS_S3_BUCKET
  ) {}
  
  async createToDo(todoItem: TodoItem): Promise<TodoItem> {
    if (!this.todosTable) {
      throw new Error(`Todos table ${this.todosTable} not found`)
    }

    logger.info(`Inserting todo item ${todoItem.todoId} into table ${this.todosTable}`)
  
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    logger.info(`Inserted item: ${todoItem}`)

    return todoItem
  }

  async getToDos(userId: String): Promise<TodoItem[]> {
    if (!this.todosTable) {
      throw new Error(`Todos table ${this.todosTable} not found`)
    }

    logger.info(`Get todo items from user ${userId}`)
  
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
     }
    }).promise()

    const toDosItems = result.Items ?? [];;

    logger.info(`Found ${toDosItems.length} todo items from user ${userId}`)

    return toDosItems as TodoItem[]
  }

  async updateTodo(todoUpdate: TodoUpdate, userId: String, todoId: String) : Promise<TodoUpdate> {
    if (!this.todosTable) {
      throw new Error(`Todos table ${this.todosTable} not found`)
    }

    logger.info(`Updating todo item ${todoId} in table ${this.todosTable} for user ${userId}`)
  
    const result = await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      },
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ReturnValues: 'UPDATED_NEW' /* https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html */

    }).promise()


    logger.info(`New updated output: ${result}`)

    return todoUpdate
  }


  async updateAttachmentUrl(thumbnailUrl: String, userId: String, todoId: String) {
    if (!this.todosTable) {
      throw new Error(`Todos table ${this.todosTable} not found`)
    }

    logger.info(`Updating item ${todoId}'s attachmentUrl in table ${this.todosTable} for user ${userId}`)
  
    // Check if thumbnailUrl exists
    const s3 = new XAWS.S3()

    const s3Params = {
      Bucket: this.thumbnailsBucket,
      Key: todoId
    }

    let thumbnailExists = false
    for (let i=0; i < 3; i++) {
      try {
        await s3.headObject(s3Params).promise()
        logger.info("Thumbnail exists")
        thumbnailExists = true
        break
      } catch (err) {
        logger.info("Thumbnail does not exist. Retrying...")
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    if (!thumbnailExists) {
      throw new Error(`Thumbnail does not exist!`)
    }

    // Updating DynamoDB
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set #attachmentUrl = :thumbnailUrl',
      ExpressionAttributeValues: {
        ':thumbnailUrl': thumbnailUrl
      },
      ExpressionAttributeNames: {
        '#attachmentUrl': 'attachmentUrl'
      }
    }).promise()

    logger.info(`updated attachmentUrl`)
  }


  async deleteTodo(userId: String, todoId: String) {
    if (!this.todosTable) {
      throw new Error(`Todos table ${this.todosTable} not found`)
    }

    logger.info(`Deleting todo item ${todoId} in table ${this.todosTable} for user ${userId}`)
  
    const result = await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      ReturnValues: 'ALL_OLD' /* https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteItem.html */
    }).promise()

    logger.info(`Deleted item: ${result}`)
  }
}

export function createDynamoDBClient() {
  logger.info('Creating DynamoDB Client')
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
