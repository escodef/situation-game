FROM node:25.2-alpine3.22

RUN mkdir -p /opt/app

WORKDIR /opt/app

COPY package*.json ./

RUN npm install

COPY src/ .

RUN npm build

EXPOSE 3000

CMD [ "npm", "start"]