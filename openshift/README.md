# OpenShift Deployment

The demo can be deployed to OpenShift either manually, or by the use of the
pipeline feature of OpenShift. This document describes how to deploy the demo
using pipelines.

## Project setup with pipelines

The pipeline setup consists out of three projects; `game-cicd`, `game-test`,
and `game-prod`. The `game-cicd` project will contain a Jenkins instance with
persistent storage, and the pipeline buildconfigs should be added to this
project. The enable the jenkins instance to alter the configution of the
`game-test` and `game-prod` instances, a few policies will be set that will
grant the Jenkins service account edit rights.

```bash
oc new-project game-cicd
oc new-app jenkins-persistent
oc new-project game-test
oc new-project game-prod
oc policy add-role-to-user edit system:serviceaccount:game-cicd:jenkins -n game-test
oc policy add-role-to-user edit system:serviceaccount:game-cid:jenkins -n game-prod
```

## Pipelines

The setup consists out of three pipelines. One pipeline for the base setup,
which will deploy Kafka/Zookeeper and PostgreSQL. And two seperate pipelines
which are responsible for the deployment of the `game` and `highscore` services.

```bash
oc process -f pipelines/pipeline-system.yaml | oc create -f - -n game-cicd
```

```bash
oc process -f pipelines/pipeline-template.yaml \
   -p APPLICATION_NAME="game" \
   -p TEMPLATE="openshift/templates/game-template.yaml" \
   -p CONTEXT_DIR="game" \
   | oc create -f - -n game-cicd
```

```bash
oc process -f pipelines/pipeline-template.yaml \
   -p APPLICATION_NAME="highscore" \
   -p TEMPLATE="openshift/templates/highscore-template.yaml" \
   -p CONTEXT_DIR="highscore" \
   | oc create -f - -n game-cicd
```

To deploy a newer version of the demo, the pipelines should be started. The
deployment will automatically setup the `game-test` project based on the
templates that are present in the `templates` folder, as configured in the
`pipeline-template.yaml`. After this deployment is done, it will ask for
approval to deploy to `game-prod` as well.

## Deploy without pipelines

The project can be deployed with out a ci-cd integration as well. To do this,
simply process the templates in the templates folder, and rollout both game and
highscore services. The additional required services are deployed upon
processing the templates.

```bash
oc new-project game
oc process -f templates/database-template.yaml | create -f -
oc process -f templates/kafka-template.yaml | create -f -
oc process -f templates/highscore-template.yaml | create -f -
oc process -f templates/game-template.yaml | create -f -
oc rollout latest dc/game
oc rollout latest dc/highscore
```
