# Frontend

To build the frontend:

```
oc process -f openshift.yaml | oc create -f -
oc start-build frontend --from-dir=.
```
