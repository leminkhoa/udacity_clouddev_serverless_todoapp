import { TodosAccess } from '../../src/dataLayer/todosAccess'

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

const getPromise = jest.fn()

const dynamoDbClient: any = {
  query: jest.fn(() => { return {
      promise: getPromise
    }
  }),
}

const todosAccessInstance = new TodosAccess(dynamoDbClient, 'mock_table', 'mock_index', 'mock_thumbnail_bucket')

test('test get todos when it exists', async () => {
    getPromise.mockResolvedValue({
      Items: todos
    })
  
    const result = await todosAccessInstance.getToDos('test-user-id')
    console.log(result)
  
    expect(result).toEqual(todos)
  })


test('test get todos when it does not exist', async () => {
    getPromise.mockResolvedValue({
        Items: []
    })

    const result = await todosAccessInstance.getToDos('test-user-id')

    expect(result).toEqual([])
})
