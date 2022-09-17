# badgeman
The digital name badge management server for the Festival of Ideas 2022

## Useful cURL testing commands
- Posting a new badge

  `curl -d "@posttest.json" -X POST -H "Content-Type: application/json" http://localhost:3001/api/badges`

- Updating a badge by MAC address

  `curl -d "@puttest.json" -X PUT -H "Content-Type: application/json" http://localhost:3001/api/badges/XXXXXXXXXXXX`

- Getting network devices

  `curl -H 'Content-Type: application/json' http://localhost:3001/api/network`
