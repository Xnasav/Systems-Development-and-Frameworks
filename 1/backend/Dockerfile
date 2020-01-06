FROM node:10 as base
WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000

CMD ["npm", "run", "start"]
