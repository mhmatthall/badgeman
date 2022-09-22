# badgeman
The digital name badge management server for the Festival of Ideas 2022.

## Architecture
This version of the app is designed to be run entirely locally on a private subnet. It incorporates a web server for the front-end badge editor web app and a REST back-end API server for data access for the UI/badges.

Here's a diagram (click to open Miro):
[![Digibadge_architecture170922](https://user-images.githubusercontent.com/42594962/190867248-da39a1ed-51c1-450b-aa64-2f69235e85e9.jpg)](https://miro.com/app/board/uXjVPdtm_zU=/?share_link_id=651121183805)

## Requirements
- a local [MongoDB server](https://www.mongodb.com/docs/manual/installation/)
- a DHCP server on the subnet (I'm using [dhcpsrv](https://www.dhcpserver.de/cms/) on Windows 10)
- a meaty wireless access point
- once installed, a modification to `./client/node_modules/react-scripts/config/webpack.config.js` at the `resolve` tag to fix node polyfill issues:
  ```
    resolve: {
      fallback: {
        "fs": false,
        "tls": false,
        "net": false,
        "http": require.resolve("stream-http"),
        "https": false,
        "zlib": require.resolve("browserify-zlib") ,
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util/"),
        "assert": require.resolve("assert/"),
        "buffer": require.resolve("buffer/"),
        "crypto": require.resolve("crypto-browserify")
      },
  ```

## Repo structure
```
.
└── .gitignore
└── README.md
└── LICENSE
└── package-lock.json
└── package.json
└── api
│   └── app.js
│   └── bin
│   │   └── www
│   └── models
│   │   └── Badge.js
│   └── package-lock.json
│   └── package.json
│   └── public
│   │   └── stylesheets
│   │   │   └── style.css
│   └── routes
│   │   └── api.js
│   │   └── index.js
│   │   └── users.js
│   └── views
│   │   └── error.jade
│   │   └── index.jade
│   │   └── layout.jade
└── client
    └── README.md
    └── package-lock.json
    └── package.json
    └── public
    │   └── favicon.ico
    │   └── index.html
    │   └── logo192.png
    │   └── logo512.png
    │   └── manifest.json
    │   └── robots.txt
    └── src
        └── App.css
        └── App.js
        └── index.css
        └── index.js
        └── logo.svg
        └── reportWebVitals.js
```

## API reference
- `GET /badges` gets all data for all badges
- `GET /badges/XXXXXXXXXXXX` gets all data for a registered badge, given a MAC address
- `GET /badges/id2mac/X` gets the MAC address of a badge given its ID
- `POST /badges` registers a new badge. Request format:
  ```
      {
          "macAddress" : "XXXXXXXXXXXX",
          "name":"X",
          "pronouns":"X",
          "affiliation":"X",
          "message":"X",
          "image":"X"
      }
  ```

- `PUT /badges/XXXXXXXXXXXX` updates the data for a badge. Request format:
  ```
      {
          "name":"X",
          "pronouns":"X",
          "affiliation":"X",
          "message":"X",
          "image":"X"
      }
  ```
  
- `GET /network` gets a list of all the devices on the network
- `GET /network/badges` gets a list of all the badges on the network

## Testing
I really cba adding proper testing to this but here's some useful cURL requests for testing the API 😊:
- Posting a new badge

  `curl -d "@posttest.json" -X POST -H "Content-Type: application/json" http://localhost:3001/api/badges`

- Updating a badge by MAC address

  `curl -d "@puttest.json" -X PUT -H "Content-Type: application/json" http://localhost:3001/api/badges/XXXXXXXXXXXX`

- Getting network devices

  `curl -H 'Content-Type: application/json' http://localhost:3001/api/network`
