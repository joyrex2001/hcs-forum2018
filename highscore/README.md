# Highscore service

## Example curl commands

Add a score to the highscore database:
```bash
curl localhost:9090/score -X PUT \
     -d '{ "name": "joyrex2001", "score": 100, "userId": "1dc9b6c8-d921-434c-a496-f41f33c79d83" }' -H "Content-Type: application/json"
```

Delete a score from the highscore database:
```bash
curl localhost:9090/score/67b3a175-6dac-4346-b879-3d7192882a81 -X DELETE
```

Show highscores:
```bash
curl localhost:9090/highscore
```

Show scores by user:
```bash
curl localhost:9090/user/1dc9b6c8-d921-434c-a496-f41f33c79d83/score
```