const {ApolloServer, gql} = require('apollo-server-express');
const {createTestClient} = require('apollo-server-testing');

const typeDefs = require('./schema.js');
const resolvers = require('./resolvers.js');
const {getDriver} = require('./neo4j.js')
const { rule, shield, and, or, not } = require('graphql-shield')
const { applyMiddleware } = require('graphql-middleware')
const { makeExecutableSchema } = require("graphql-tools");

let query, mutate, test_id, user

const driver = getDriver()

const isAuthenticated = rule({ cache: 'contextual' })(
    async (parent, args, ctx, info) => {
        if(ctx.user) {
            return true
        } else {
            return false
        }
    },
)

const permissions = shield({
    Query: {
        todos: isAuthenticated,
        completedTodos: isAuthenticated
    },
    Mutation: {
        addTodo: isAuthenticated,
        deleteUser: isAuthenticated,
        finishTodo: isAuthenticated,
        deleteTodo: isAuthenticated,
        editTodo: isAuthenticated,
    }
})

const schema = applyMiddleware(
    makeExecutableSchema({
        typeDefs,
        resolvers
    }),
    permissions,
);

beforeAll(async () => {
    const server = new ApolloServer({
        schema,
        context: async ({ req}) => {
            return {
                driver,
                user: user
            }
        }
    });

    const client = createTestClient(server);
    mutate = client.mutate
    query = client.query
})

beforeEach(async () => {
    user = null
})

const GET_TODOS = gql`
query AllTodos($limit: Int!){
  todos(limit: $limit, skip: 0){
    message
    completed
    id
  }
}`;

const GET_COMPLETED_TODOS = gql`
query CompletedTodos{
  completedTodos{
    message
    completed
    id
  }
}`;

const CREATE_TODO = gql`
	mutation CreateTodo($message: String!){
		addTodo(message: $message) {
			id,
            message,
			completed
        }
    }`;

const EDIT_TODO = gql`
	mutation EditTodo($id: ID!){
   		editTodo(id: $id, message: "Tests zweimal implementieren"){
   		id,
     	message,
     	completed
   		}
    }`;

const DELETE_TODO = gql`
	mutation DeleteTodo($id: ID!){
   		deleteTodo(id: $id)
    }`;

const FINISH_TODO = gql`
	mutation FinishTodo($id: ID!){
   		finishTodo(id: $id) {
   		    id,
   		    message,
   		    completed
   		}
    }`;

const ADD_USER = gql`
	mutation AddUser{
		addUser(login: "milan", password: "password") {
		id,
		login
		}
    }`;

const DELETE_USER = gql`
	mutation DeleteUser{
		deleteUser
    }`;


describe('Get Todo', () => {
    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_USER})
        user = {
            id: user_tmp.data.addUser.id,
            login: user_tmp.data.addUser.login
        }
        const todo = await mutate({mutation: CREATE_TODO, variables: {message: "Test"}})
        test_id = todo.data.addTodo.id
    })

    it("Receives users Todos", async () => {
        const todo = await query({query: GET_TODOS, variables: {limit: 10}})
        expect(todo.data).toHaveProperty("todos")
    })
    it("Receives one todo (LIMIT 1)", async () => {
        const todo = await query({query: GET_TODOS, variables: {limit: 1}})
        expect(todo.data.todos).toHaveLength(1)
    })

    afterEach(async () => {
        await mutate({mutation: DELETE_TODO, variables: {id: test_id}})
        await mutate({mutation: DELETE_USER})
    })

})

describe('Get Todos unauthorized', () => {
    it("Receives todos unauthenticated", async () => {
        const todo = await query({query: GET_TODOS, variables: {limit: 10}})
        expect(todo.errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
})

describe('Get completed todos only (DESC)', () => {
    let todo

    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_USER})
        user = {
            id: user_tmp.data.addUser.id,
            login: user_tmp.data.addUser.login
        }
    })

    it("Receives all completed todos", async () => {
        const todo_c = await mutate({mutation: CREATE_TODO, variables: {message: "c"}})
        const todo_a = await mutate({mutation: CREATE_TODO, variables: {message: "a"}})
        const todo_b = await mutate({mutation: CREATE_TODO, variables: {message: "b"}})

        await mutate({mutation: FINISH_TODO, variables: {id: todo_c.data.addTodo.id}})
        await mutate({mutation: FINISH_TODO, variables: {id: todo_a.data.addTodo.id}})
        await mutate({mutation: FINISH_TODO, variables: {id: todo_b.data.addTodo.id}})

        todo = await query({query: GET_COMPLETED_TODOS})
        expect(todo.data.completedTodos[0].completed).toEqual(true)
        expect(todo.data.completedTodos[1].completed).toEqual(true)
        expect(todo.data.completedTodos[2].completed).toEqual(true)

        await mutate({mutation: DELETE_TODO, variables: {id: todo_c.data.addTodo.id}})
        await mutate({mutation: DELETE_TODO, variables: {id: todo_a.data.addTodo.id}})
        await mutate({mutation: DELETE_TODO, variables: {id: todo_b.data.addTodo.id}})

    })
    afterEach(async () => {
        await mutate({mutation: DELETE_USER})
    })

})


describe('Create Todo Item', () => {
    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_USER})
        user = {
            id: user_tmp.data.addUser.id,
            login: user_tmp.data.addUser.login
        }
    })

    it("Creates a new Todo", async () => {
        const todo = await mutate({mutation: CREATE_TODO, variables: {message: "test"}})
        expect(todo.data.addTodo.id).toEqual(expect.any(String))
        await mutate({mutation: DELETE_TODO, variables: {id: todo.data.addTodo.id}})
    })

    afterEach(async () => {
        await mutate({mutation: DELETE_USER})
    })
})

describe('Updates Todo Item', () => {
    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_USER})
        user = {
            id: user_tmp.data.addUser.id,
            login: user_tmp.data.addUser.login
        }
        const todo = await mutate({mutation: CREATE_TODO, variables: {message: "Test"}})
        test_id = todo.data.addTodo.id
    })

    it("Update a new Todo", async () => {
        const todo = await mutate({mutation: EDIT_TODO, variables: {id: test_id}})
        expect(todo.data.editTodo.id).toEqual(expect.any(String))
    })

    it("Updates with wrong ID", async () => {
        const todo = await mutate({mutation: EDIT_TODO, variables: {id: 12}})
        expect(todo.data).toMatchObject(
            {"editTodo": null}
        )
    })
    afterEach(async () => {
        await mutate({mutation: DELETE_TODO, variables: {id: test_id}})
        await mutate({mutation: DELETE_USER})
    })
})

describe('Delete Todo', () => {
    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_USER})
        user = {
            id: user_tmp.data.addUser.id,
            login: user_tmp.data.addUser.login
        }
    })

    it("deletes Todo", async () => {
        const todo = await mutate({mutation: CREATE_TODO, variables: {message: "Create todo once"}})
        const del = await mutate({mutation: DELETE_TODO, variables: {id: todo.data.addTodo.id}})
        expect(del.data).toMatchObject(
            {"deleteTodo": true}
        )
    })
    it("deletes Todo with wrong ID", async () => {
        const todo = await mutate({mutation: DELETE_TODO, variables: {id: 12}})
        expect(todo.data).toMatchObject(
            {"deleteTodo": true}
        )
    })

    afterEach(async () => {
        await mutate({mutation: DELETE_USER})
    })
})

describe('Finish Todo', () => {
    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_USER})
        user = {
            id: user_tmp.data.addUser.id,
            login: user_tmp.data.addUser.login
        }
        const todo = await mutate({mutation: CREATE_TODO, variables: {message: "Test"}})
        test_id = todo.data.addTodo.id
    })

    it("finishes Todo", async () => {
        const todo = await mutate({mutation: FINISH_TODO, variables: {id: test_id}})
        expect(todo.data.finishTodo.id).toEqual(expect.any(String))
    })
    it("finishes Todo with wrong ID", async () => {
        const todo = await mutate({mutation: FINISH_TODO, variables: {id: 4}})
        expect(todo.data).toMatchObject(
            {
                "finishTodo": null
            }
        )
    })
    afterEach(async () => {
        await mutate({mutation: DELETE_TODO, variables: {id: test_id}})
        await mutate({mutation: DELETE_USER})
    })

})
