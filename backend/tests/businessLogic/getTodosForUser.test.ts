import { TodosAccess } from '../../src/dataLayer/todosAccess'
import { getTodosForUser } from '../../src/businessLogic/todos'

jest.mock('../../src/dataLayer/todosAccess')

const todos = [
      {
          "todoId": "5c232aa8-bf06-433f-91c0-b9a889ab7374",
          "attachmentUrl": "https://serverless-todo-app-670020652061-thumbnails-dev.s3.amazonaws.com/5c232aa8-bf06-433f-91c0-b9a889ab7374",
          "userId": "test-user-id",
          "dueDate": "2023-06-24",
          "createdAt": "2023-06-17T15:19:40.414Z",
          "name": "abc",
          "done": false
      }
  ]

const todosAccessInstance = (TodosAccess as any).mock.instances[0]

test('should return todos from the access layer', async () => {
  todosAccessInstance.getToDos.mockResolvedValue(todos)
  const result = await getTodosForUser('test-user-id')

  expect(result).toEqual(todos)
  expect(todosAccessInstance.getToDos).toHaveBeenCalledWith('test-user-id')
})