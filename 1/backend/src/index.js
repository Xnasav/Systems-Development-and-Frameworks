const neo4j = require('neo4j-driver');
const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { getDriver } = require('./neo4j.js')
const { rule, shield, and, or, not } = require('graphql-shield')
const { applyMiddleware } = require('graphql-middleware')
const { makeExecutableSchema } = require("graphql-tools");

var SECRET_KEY = fs.readFileSync('./src/key/secret.key', 'utf8');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

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

const server = new ApolloServer({
  schema,
  context: async ({ req}) => {
    let token = req.headers.authorization
    let id = null
    if (token){
      token = token.replace('Bearer ', '')
      try {
        const decoded = jwt.verify(token, SECRET_KEY)
        id = decoded.sub
      }
      catch(err) {
        token = null
      }
    } else {
      token = null
    }
    const session = driver.session()
    const getUserCypher = `
    MATCH (user:User {id: $id})
    RETURN user {.id, .login}
    LIMIT 1
  `
    const result = await session.run(getUserCypher, { id: id })
    await session.close()
    let [currentUser] = await result.records.map(record => {
      return record.get('user')
    })
    if (!currentUser){
      currentUser = null
    } else {
      currentUser = {user: currentUser}
    }
    return {
      driver,
      ...currentUser
    }
  }
});


server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});



