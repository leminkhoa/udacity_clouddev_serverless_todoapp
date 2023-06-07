import * as uuid from 'uuid'

import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('businessLogic')

const attachmentutils = new AttachmentUtils()
const todosAccess = new TodosAccess()

// export async function getAllToDos(): Promise<TodoItem[]> {
//   return todosAccess.getAllToDos()
// }

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
  logger.info('New todo item: ', newTodo)

  return await todosAccess.createToDo(newTodo)
}


export async function getTodosForUser(
  userId: string
): Promise<TodoItem[]> {

  return await todosAccess.getToDos(userId)
}