#! /bin/bash
yarn build
docker build -t randresf2/dev-server:latest .
docker push randresf2/dev-server:latest
eval `ssh-agent -s`
ssh-add ~/.ssh/aforodev_ed
ssh root@68.183.102.2 "docker pull randresf2/dev-server:latest && docker tag randresf2/dev-server:latest dokku/aforo-dev:latest && dokku tags:deploy aforo-dev latest"

