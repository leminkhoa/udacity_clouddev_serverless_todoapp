import * as uuid from 'uuid'

import { TodosAccess }        from '../dataLayer/todosAccess'
import { AttachmentUtils }    from '../helpers/attachmentUtils';
import { TodoItem }           from '../models/TodoItem'
import { TodoUpdate }         from '../models/TodoUpdate'
import { CreateTodoRequest }  from '../requests/CreateTodoRequest'
import { UpdateTodoRequest }  from '../requests/UpdateTodoRequest'
import { createLogger }       from '../utils/logger'


const logger = createLogger('businessLogic')

const attachmentutils = new AttachmentUtils()
const todosAccess = new TodosAccess()

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const todoId = uuid.v4()
  const newTodo = {
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: attachmentutils.getAttachmentUrl(todoId)
  }
  logger.info(`Start calling createToDo function`)

  return await todosAccess.createToDo(newTodo)
}


export async function getTodosForUser(
  userId: string
): Promise<TodoItem[]> {

  return await todosAccess.getToDos(userId)
}


export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  userId: string,
  todoId: string
): Promise<TodoUpdate> {
  
  logger.info(`Start calling updateToDo function with this updated information: ${updateTodoRequest}`)

  return await todosAccess.updateTodo(updateTodoRequest, userId, todoId)
}

export async function updateAttachmentUrl(
  userId: string,
  todoId: string, 
) {
  logger.info(`Start calling updateAttachmentUrl for todoId: ${todoId}`)

  const attachmentUrl = attachmentutils.getAttachmentUrl(todoId)
  const thumbnailUrl = attachmentutils.getThumbnailUrl(todoId)

  logger.info(`Updating todo ${todoId}'s attachment URL ${attachmentUrl} into ${thumbnailUrl}`)

  await todosAccess.updateAttachmentUrl(thumbnailUrl, userId, todoId)
}


export async function deleteTodo(
  userId: string,
  todoId: string
) {

  logger.info('Start calling deleteToDo function')

  todosAccess.deleteTodo(userId, todoId)
}


export async function createUploadUrl(
  userId: string,
  todoId: string
) {
  
  logger.info(`Start generating presigned url for user ${userId}`)
  
  const url = attachmentutils.getUploadUrl(todoId)
  
  logger.info(`Generated url: ${url}`)
  return url 
}
