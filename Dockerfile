FROM node:alpine3.10

COPY package.json .

RUN yarn install --production

COPY ./dist .

ENV NODE_ENV production
ENV REACT_APP_URL aforo.dev

EXPOSE 80

CMD ["yarn", "start"]