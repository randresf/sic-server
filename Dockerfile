FROM node:alpine3.10

COPY package.json .

RUN yarn install --production

COPY . .

RUN yarn build

ENV NODE_ENV production
ENV REACT_APP_URL aforo.dev
ENV SUPERADMIN_KEY 74PHQITMUT

EXPOSE 80

CMD ["yarn", "start"]