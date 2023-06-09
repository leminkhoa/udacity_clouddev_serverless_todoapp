import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing updateTodo event: ', event)
    
    const todoId = event.pathParameters.todoId
    console.log('Processing update for todo Id: ', todoId)
    
    const newTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    const updatedItem = await updateTodo(newTodo, userId, todoId)

    console.log('Updated attributes', updatedItem)

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''   /* Return empty body */
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
