FROM node:10 as base
WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000

ENV HOST 0.0.0.0

CMD ["npm", "run", "start"]
