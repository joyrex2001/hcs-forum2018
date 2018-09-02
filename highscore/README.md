# Highscore service

The highscore service is responsible for storing and managing the hall of fame.
It listens to the kafka messagebus, and when a new score is published, it will
update the database by adding the score. After that it will publish a new
message to the kafka message bus which contains the current leaderboard that
should be used by the game instances.

The service also includes a REST API that will allow modification of the
contents of the hall of fame.

Example use of the REST API:

```bash
# Add a score to the highscore database:
curl localhost:9090/score -X PUT \
     -d '{ "name": "joyrex2001", "score": 100, "playerId": "1dc9b6c8-d921-434c-a496-f41f33c79d83" }' \
     -H "Content-Type: application/json"

# Delete a score from the highscore database:
curl localhost:9090/score/67b3a175-6dac-4346-b879-3d7192882a81 -X DELETE

# Show highscores:
curl localhost:9090/highscore

# Show scores by user:
curl localhost:9090/player/1dc9b6c8-d921-434c-a496-f41f33c79d83/score
```

The service exposes prometheus values on: http://localhost:9090/actuator/prometheus
