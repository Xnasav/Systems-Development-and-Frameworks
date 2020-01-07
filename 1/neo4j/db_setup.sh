#!/usr/bin/env bash

NEO4J_AGENTNAME=neo4j
NEO4J_PASSWORD=password

if [ -z "$NEO4J_AGENTNAME" ] || [ -z "$NEO4J_PASSWORD" ]; then
  echo "Please set NEO4J_AGENTNAME and NEO4J_PASSWORD environment variables."
  echo "Setting up database constraints and indexes will probably fail because of authentication errors."
  echo "E.g. you could \`cp .env.template .env\` unless you run the script in a docker container"
fi

until echo 'RETURN "Connection successful" as info;' | cypher-shell
do
  echo "Connecting to neo4j failed, trying again..."
  sleep 1
done

echo '
RETURN "Here is a list of indexes and constraints BEFORE THE SETUP:" as info;
CALL db.indexes();
' | cypher-shell

echo '
CREATE CONSTRAINT ON (t:Mission)       ASSERT t.id IS UNIQUE;
CREATE CONSTRAINT ON (u:Agent)       ASSERT u.id IS UNIQUE;
CREATE CONSTRAINT ON (u:Agent)       ASSERT u.login IS UNIQUE;
' | cypher-shell

echo '
RETURN "Setting up all the indexes and constraints seems to have been successful. Here is a list AFTER THE SETUP:" as info;
CALL db.indexes();
' | cypher-shell
