const { gql } = require('apollo-server');
	
const typeDefs = gql`
type Query {
  missions(limit: Int!, skip: Int!): [Mission],
  completedMissions: [Mission]
}

type Mission {
	id: ID!
	message: String!
	completed: Boolean!
}

type Agent {
    id: String!
    login: String!
    password: String!
}


type Mutation {
	addMission(message: String!): Mission
	addAgent(login: String!, password: String!): Agent
	deleteAgent: Boolean
	finishMission(id: ID!): Mission
	deleteMission(id: ID!): Boolean
	editMission(id: ID!, message: String!): Mission
	finishWithMerge(id: ID!): Mission
	assignMissionToAgent(user: String!, id: ID!): Boolean
	login(usr: String!, pwd: String!): String
}		
`;

module.exports = typeDefs;
