FROM neo4j:3.5

COPY db_setup.sh /usr/local/bin/db_setup

RUN apt-get update && apt-get -y install wget htop
RUN wget https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/3.5.0.4/apoc-3.5.0.4-all.jar -P plugins/
