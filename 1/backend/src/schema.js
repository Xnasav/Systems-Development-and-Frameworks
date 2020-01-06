const { gql } = require('apollo-server');
	
const typeDefs = gql`
type Query {
  todos(limit: Int!, skip: Int!): [Todo],
  completedTodos: [Todo]
}

type Todo {
	id: ID!
	message: String!
	completed: Boolean!
}

type User {
    id: String!
    login: String!
    password: String!
}


type Mutation {
	addTodo(message: String!): Todo
	addUser(login: String!, password: String!): User
	deleteUser: Boolean
	finishTodo(id: ID!): Todo
	deleteTodo(id: ID!): Boolean
	editTodo(id: ID!, message: String!): Todo
	finishWithMerge(id: ID!): Todo
	assignTodoToUser(user: String!, id: ID!): Boolean
	login(usr: String!, pwd: String!): String
}		
`;

module.exports = typeDefs;
