# SIC server
server in nodejs for the SIC app

## Dependencies
- postgres v12+ [install](https://www.robinwieruch.de/postgres-sql-macos-setup)
  - create database with name `sic-server` and change the values of `username` and `password` in file `src/index.js`
  _NOTE in windows system password param is required, for unix systems it is not_

## Setup
- run `yarn install`
- run `yarn watch` to watch typescript changes and update the `dist` folder
- run `yarn dev` to run the app from `dist`
