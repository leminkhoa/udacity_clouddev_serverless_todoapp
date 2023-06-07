import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('todosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess{
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}
  
  async createToDo(todoItem: TodoItem): Promise<TodoItem> {
    if (!this.todosTable) {
      throw new Error('Todos table not found')
    }

    logger.info(`Inserting todo item ${todoItem.todoId} into table ${this.todosTable}`)
  
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async getToDos(userId: String): Promise<TodoItem[]> {
    if (!this.todosTable) {
      throw new Error('Todos table not found')
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
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
