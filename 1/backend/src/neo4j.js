const neo4j = require('neo4j-driver');

let driver

function getDriver(options = {}) {
    const {
        uri = "bolt://neo4j:7687",
        username = "neo4j",
        password = "password",
    } = options
    if (!driver) {
        driver = neo4j.driver(uri, neo4j.auth.basic(username, password))
    }
    return driver
}

exports.getDriver = getDriver

