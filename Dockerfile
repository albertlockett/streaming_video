FROM node:10
WORKDIR /usr/src/app
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]
