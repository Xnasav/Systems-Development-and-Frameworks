const jwt = require('jsonwebtoken');
const fs = require('fs');
const {uuid} = require('uuidv4');

let data;

let SECRET_KEY = fs.readFileSync('./src/key/secret.key', 'utf8');

const resolvers = {
    Query: {
        missions: async (parent, args, context) => {
            // JSON.parse(JSON.stringify(data.mission))
            if (args.limit !== "" && args.limit !== null && args.skip !== "" && args.skip !== null) {
                const {driver} = context
                let getMissionCypher
                getMissionCypher = `
                    MATCH (mission:Mission)-[:ASSIGNED]->(u:Agent)
                    WHERE u.login = $username
                    RETURN mission.id, mission.message, mission.completed ORDER BY mission.message SKIP $skip LIMIT $limit 
                `


                const session = driver.session()
                try {
                    data = await session.run(getMissionCypher, {
                        username: context.user.login,
                        limit: args.limit,
                        skip: args.skip
                    })
                    const missions = await data.records.map(record => ({
                        id: record.get('mission.id'),
                        message: record.get('mission.message'),
                        completed: record.get('mission.completed')

                    }))
                    json_data = JSON.parse(JSON.stringify(missions))
                    return json_data
                } finally {
                    await session.close()
                }
            }
        },
        mission: async(parent, args, context) => {
            const {driver} = context
            let getMissionCypher
            getMissionCypher = `
                    MATCH (mission:Mission {id: $id})-[:ASSIGNED]->(u:Agent)
                    WHERE u.login = $username
                    RETURN mission.id, mission.message, mission.completed
                `
            const session = driver.session()
            try {
                data = await session.run(getMissionCypher, {
                    username: context.user.login,
                    id: args.id
                })
                const [mission] = await data.records.map(record => ({
                    id: record.get('mission.id'),
                    message: record.get('mission.message'),
                    completed: record.get('mission.completed')

                }))
                json_data = JSON.parse(JSON.stringify(mission))
                return json_data
            } finally {
                await session.close()
            }
        },
        completedMissions: async (parent, args, context) => {
            const {driver} = context
            const getCompletedMissionsCypher = `
                    MATCH (mission:Mission)-[:ASSIGNED]->(u:Agent) WHERE mission.completed = true AND u.login = $username
                    RETURN mission.id, mission.message, mission.completed ORDER BY mission.message
             `
            const session = driver.session()
            try {
                data = await session.run(getCompletedMissionsCypher, {username: context.user.login})
                const missions = await data.records.map(record => ({
                    id: record.get('mission.id'),
                    message: record.get('mission.message'),
                    completed: record.get('mission.completed')

                }))
                json_data = JSON.parse(JSON.stringify(missions))
                return json_data
            } finally {
                await session.close()
            }
        }
    },
    Mutation: {
        addMission: async (parent, args, context) => {
            if (args.message != "" && args.message != null) {
                const {driver} = context
                const createMissionCypher = `
                    CREATE (mission:Mission {params})
                    RETURN mission.id, mission.message, mission.completed
                `
                const assignCypher = `
                    MATCH (u:Agent), (t:Mission)
                    WHERE u.login = $login AND t.id = $id
                    CREATE p=(u)<-[a:ASSIGNED]-(t)
                    RETURN p
                `
                const params = {
                    message: args.message,
                    completed: false,
                    id: uuid(),
                    username: context.user.login
                }
                const session = driver.session()
                try {
                    data = await session.run(createMissionCypher, {params})
                    const [mission] = await data.records.map(record => ({
                        id: record.get('mission.id'),
                        message: record.get('mission.message'),
                        completed: record.get('mission.completed')

                    }))

                    await session.run(assignCypher, {login: context.user.login, id: mission.id})
                    return mission;
                } finally {
                    await session.close()
                }
            }
            return;
        },
        addAgent: async (parent, args, context) => {
            if (args.login != "" && args.login != null && args.password != "" && args.password != null) {
                const {driver} = context
                const params = {
                    id: uuid(),
                    login: args.login,
                    password: args.password
                }
                const createAgentCypher = `
                    CREATE (user:Agent {params})
                    RETURN user.id, user.login
                `
                const session = driver.session()
                try {
                    const data = await session.run(createAgentCypher, {params})
                    const [currentUsr] = await data.records.map(record => ({
                        id: record.get('user.id'),
                        login: record.get('user.login')

                    }))
                    return currentUsr
                } finally {
                    await session.close()
                }
            }
            return null;
        },
        deleteAgent: async (parent, args, context) => {
            const {driver} = context
            const createAgentCypher = `
                MATCH (u:Agent {id: $id, login: $login})
                OPTIONAL MATCH (u)<-[a:ASSIGNED]-(Mission) 
                DELETE a, u
            `
            const session = driver.session()
            try {
                await session.run(createAgentCypher, {id: context.user.id, login:context.user.login})
            } catch(err) {
                return false
            } finally {
                await session.close()
            }
            return true
        },
        deleteMission: async (parent, args, context) => {
            if (args.id != null && context.user.login) {
                const {driver} = context
                const deleteMissionCypher = `
                    MATCH (mission:Mission {id: $id})-[a:ASSIGNED]->(u:Agent) WHERE u.id = $uid and u.login=$login
                    DELETE a, mission
                `
                const session = driver.session()
                try {
                    await session.run(deleteMissionCypher, {id: args.id, uid: context.user.id, login: context.user.login})
                    return true
                }catch(err) {
                    console.log(err)
                } finally {
                    await session.close()
                }
                return false
            }
        },
        editMission: async (parent, args, context) => {
            if (args.id != null && args.message != null) {
                const {driver} = context
                const editMissionCypher = `
                    MATCH (mission:Mission {id: $id})-[:ASSIGNED]->(user:Agent {id: $uid})
                    SET mission.message = $message
                    RETURN mission.id, mission.message, mission.completed
                `
                const session = driver.session()
                try {
                    const _response = await session.run(editMissionCypher, {id: args.id, message: args.message, uid:context.user.id})
                    const [response] = await _response.records.map(record => ({
                        id: record.get('mission.id'),
                        message: record.get('mission.message'),
                        completed: record.get('mission.completed')
                    }))
                    if (response) {
                        return response

                    }
                    return null
                } finally {
                    await session.close()
                }
            }

        },
        assignMissionToAgent: async (parent, args, context) => {
            if (args.id != null && args.user != null) {
                const {driver} = context
                const assignCypher = `
                    MATCH (u:Agent), (t:Mission)
                    WHERE u.login = $login AND t.id = $id
                    CREATE p=(u)<-[a:ASSIGNED]-(t)
                    RETURN p
                `
                const session = driver.session()
                try {
                    await session.run(assignCypher, {login: args.user, id: args.id})
                    return true
                } finally {
                    await session.close()
                }
            }
        },
        finishMission: async (parent, args, context) => {
            if (args.id != null) {
                const {driver} = context
                const finishMissionCypher = `
                MATCH (mission:Mission {id: $id})-[:ASSIGNED]->(user:Agent {id: $uid})
                SET mission.completed = True
                RETURN mission.id, mission.message, mission.completed
                `
                const session = driver.session()
                try {
                    const _response = await session.run(finishMissionCypher, {id: args.id, uid:context.user.id})
                    const [response] = await _response.records.map(record => ({
                        id: record.get('mission.id'),
                        message: record.get('mission.message'),
                        completed: record.get('mission.completed')
                    }))
                    if (response) {
                        return response

                    }
                    return null
                } finally {
                    await session.close()
                }
            }
        },
        login: async (parent, args, context) => {
            if (args.usr != null && args.pwd != null) {
                let user
                const {driver} = context
                const getAgentCypher = `
                MATCH (user:Agent {login: $login, password: $password})
                RETURN user.id, user.login, user.password
                `
                const session = driver.session()
                try {
                    user = await session.run(getAgentCypher, {login: args.usr, password: args.pwd})

                } finally {
                    await session.close()
                }

                const [currentUsr] = await user.records.map(record => ({
                    id: record.get('user.id'),
                    login: record.get('user.login'),
                    password: record.get('user.password')

                }))
                if (currentUsr.login === args.usr && currentUsr.password === args.pwd) {
                    const token = jwt.sign(currentUsr, SECRET_KEY, {
                        expiresIn: '1d',
                        subject: currentUsr.id.toString(),
                    })
                    return token
                }
                return currentUsr.name
            }
        }
    }
};

module.exports = resolvers;