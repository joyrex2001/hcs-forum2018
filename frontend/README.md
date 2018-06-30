# Frontend

To build the frontend:

```
oc process -f openshift.yaml | oc create -f -
oc start-build frontend --from-dir=.
```

This game is heavily based on [Stack the crates](https://www.emanueleferonato.com/2017/12/22/play-stack-the-crates-html5-game-my-take-on-tipsy-tower-concept-source-code-available/).
