# SIC server

server in nodejs for the SIC app

## Dependencies

- postgres v12+ [install](https://www.robinwieruch.de/postgres-sql-macos-setup)
  _NOTE in windows system password param is required, for unix systems you can choose to use defualt value_

## Setup

- create database in postgress with the name you want
- create `.env` file on the project root folder and add the following variables with your own info
  - DB_NAME (the one from previuos step)
  - PG_USERNAME (normally can be the name of the system user)
  - PG_PWD
  - PORT (in case you want to changed, default is 4000)
- run `yarn install`
- run `yarn watch` to watch typescript changes and update the `dist` folder
- run `yarn dev` to run the app from `dist`

## Docker

you can setup the app to run in docker

# make suer you are inside the repo root folder

`docker build -t ${CUSTOM_NAME}/${container}:${tagNumber} .`
