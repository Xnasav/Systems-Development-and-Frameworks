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
        missions: isAuthenticated,
        completedMissions: isAuthenticated
    },
    Mutation: {
        addMission: isAuthenticated,
        deleteAgent: isAuthenticated,
        finishMission: isAuthenticated,
        deleteMission: isAuthenticated,
        editMission: isAuthenticated,
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

const GET_MISSIONS = gql`
query AllMissions($limit: Int!){
  missions(limit: $limit, skip: 0){
    message
    completed
    id
  }
}`;

const GET_COMPLETED_MISSIONS = gql`
query CompletedMissions{
  completedMissions{
    message
    completed
    id
  }
}`;

const CREATE_MISSION = gql`
	mutation CreateMission($message: String!){
		addMission(message: $message) {
			id,
            message,
			completed
        }
    }`;

const EDIT_MISSION = gql`
	mutation EditMission($id: ID!){
   		editMission(id: $id, message: "Tests zweimal implementieren"){
   		id,
     	message,
     	completed
   		}
    }`;

const DELETE_MISSION = gql`
	mutation DeleteMission($id: ID!){
   		deleteMission(id: $id)
    }`;

const FINISH_MISSION = gql`
	mutation FinishMission($id: ID!){
   		finishMission(id: $id) {
   		    id,
   		    message,
   		    completed
   		}
    }`;

const ADD_AGENT = gql`
	mutation AddAgent{
		addAgent(login: "milan", password: "password") {
		id,
		login
		}
    }`;

const DELETE_AGENT = gql`
	mutation DeleteAgent{
		deleteAgent
    }`;


describe('Get Mission', () => {
    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_AGENT})
        user = {
            id: user_tmp.data.addAgent.id,
            login: user_tmp.data.addAgent.login
        }
        const mission = await mutate({mutation: CREATE_MISSION, variables: {message: "Test"}})
        test_id = mission.data.addMission.id
    })

    it("Receives agents Missions", async () => {
        const mission = await query({query: GET_MISSIONS, variables: {limit: 10}})
        expect(mission.data).toHaveProperty("missions")
    })
    it("Receives one mission (LIMIT 1)", async () => {
        const mission = await query({query: GET_MISSIONS, variables: {limit: 1}})
        expect(mission.data.missions).toHaveLength(1)
    })

    afterEach(async () => {
        await mutate({mutation: DELETE_MISSION, variables: {id: test_id}})
        await mutate({mutation: DELETE_AGENT})
    })

})

describe('Get Missions unauthorized', () => {
    it("Receives mission unauthenticated", async () => {
        const mission = await query({query: GET_MISSIONS, variables: {limit: 10}})
        expect(mission.errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
})

describe('Get completed mission only (DESC)', () => {
    let mission

    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_AGENT})
        user = {
            id: user_tmp.data.addAgent.id,
            login: user_tmp.data.addAgent.login
        }
    })

    it("Receives all completed mission", async () => {
        const mission_c = await mutate({mutation: CREATE_MISSION, variables: {message: "c"}})
        const mission_a = await mutate({mutation: CREATE_MISSION, variables: {message: "a"}})
        const mission_b = await mutate({mutation: CREATE_MISSION, variables: {message: "b"}})

        await mutate({mutation: FINISH_MISSION, variables: {id: mission_c.data.addMission.id}})
        await mutate({mutation: FINISH_MISSION, variables: {id: mission_a.data.addMission.id}})
        await mutate({mutation: FINISH_MISSION, variables: {id: mission_b.data.addMission.id}})

        mission = await query({query: GET_COMPLETED_MISSIONS})
        expect(mission.data.completedMissions[0].completed).toEqual(true)
        expect(mission.data.completedMissions[1].completed).toEqual(true)
        expect(mission.data.completedMissions[2].completed).toEqual(true)

        await mutate({mutation: DELETE_MISSION, variables: {id: mission_c.data.addMission.id}})
        await mutate({mutation: DELETE_MISSION, variables: {id: mission_a.data.addMission.id}})
        await mutate({mutation: DELETE_MISSION, variables: {id: mission_b.data.addMission.id}})

    })
    afterEach(async () => {
        await mutate({mutation: DELETE_AGENT})
    })

})


describe('Create Mission Item', () => {
    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_AGENT})
        user = {
            id: user_tmp.data.addAgent.id,
            login: user_tmp.data.addAgent.login
        }
    })

    it("Creates a new Mission", async () => {
        const mission = await mutate({mutation: CREATE_MISSION, variables: {message: "test"}})
        expect(mission.data.addMission.id).toEqual(expect.any(String))
        await mutate({mutation: DELETE_MISSION, variables: {id: mission.data.addMission.id}})
    })

    afterEach(async () => {
        await mutate({mutation: DELETE_AGENT})
    })
})

describe('Updates Mission Item', () => {
    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_AGENT})
        user = {
            id: user_tmp.data.addAgent.id,
            login: user_tmp.data.addAgent.login
        }
        const mission = await mutate({mutation: CREATE_MISSION, variables: {message: "Test"}})
        test_id = mission.data.addMission.id
    })

    it("Update a new Mission", async () => {
        const mission = await mutate({mutation: EDIT_MISSION, variables: {id: test_id}})
        expect(mission.data.editMission.id).toEqual(expect.any(String))
    })

    it("Updates with wrong ID", async () => {
        const mission = await mutate({mutation: EDIT_MISSION, variables: {id: 12}})
        expect(mission.data).toMatchObject(
            {"editMission": null}
        )
    })
    afterEach(async () => {
        await mutate({mutation: DELETE_MISSION, variables: {id: test_id}})
        await mutate({mutation: DELETE_AGENT})
    })
})

describe('Delete Mission', () => {
    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_AGENT})
        user = {
            id: user_tmp.data.addAgent.id,
            login: user_tmp.data.addAgent.login
        }
    })

    it("deletes Mission", async () => {
        const mission = await mutate({mutation: CREATE_MISSION, variables: {message: "Create mission once"}})
        const del = await mutate({mutation: DELETE_MISSION, variables: {id: mission.data.addMission.id}})
        expect(del.data).toMatchObject(
            {"deleteMission": true}
        )
    })
    it("deletes Mission with wrong ID", async () => {
        const mission = await mutate({mutation: DELETE_MISSION, variables: {id: 12}})
        expect(mission.data).toMatchObject(
            {"deleteMission": true}
        )
    })

    afterEach(async () => {
        await mutate({mutation: DELETE_AGENT})
    })
})

describe('Finish Mission', () => {
    beforeEach(async () => {
        const user_tmp = await mutate({mutation: ADD_AGENT})
        user = {
            id: user_tmp.data.addAgent.id,
            login: user_tmp.data.addAgent.login
        }
        const mission = await mutate({mutation: CREATE_MISSION, variables: {message: "Test"}})
        test_id = mission.data.addMission.id
    })

    it("finishes Mission", async () => {
        const mission = await mutate({mutation: FINISH_MISSION, variables: {id: test_id}})
        expect(mission.data.finishMission.id).toEqual(expect.any(String))
    })
    it("finishes Mission with wrong ID", async () => {
        const mission = await mutate({mutation: FINISH_MISSION, variables: {id: 4}})
        expect(mission.data).toMatchObject(
            {
                "finishMission": null
            }
        )
    })
    afterEach(async () => {
        await mutate({mutation: DELETE_MISSION, variables: {id: test_id}})
        await mutate({mutation: DELETE_AGENT})
    })

})
