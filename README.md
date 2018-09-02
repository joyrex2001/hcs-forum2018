# HCS Company - Red Hat Forum 2018 Demo

This repository contains a game "Stack The Containers" and some additional
services to demonstrate a microservices setup. The project can be run both
locally, using `docker-compose`, or in an OpenShift environment.

## Running using docker-compose

To run the project in docker-compose, you can simply do ```docker-compose up```
which will build the project and sets up the required services. It might happen
that the `game` service started before the `kafka` service, causing it to stop
the service. You can use ```docker-compose restart game``` once kafka is
running to fix this.

## Running in OpenShift

To run this project in OpenShift, follow the instructions in the `README.md`
in the `openshift` folder. This will guide you through a setup that uses the
OpenShift jenkins pipeline integration to deploy to a development and
production project.

## Thank you...

This project is based on a game called "Stack the crates" by
[Emanuele Feranto](https://www.emanueleferonato.com/). Check out his awesome
blog about game development!
