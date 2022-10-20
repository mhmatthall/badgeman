# badgeman
A standalone digital name badge management server designed for use in large special events. Originally created for the Festival of Ideas 2022 at Swansea University.

## Architecture
This version of the app is designed to be run entirely locally on a private subnet. It incorporates a web server for the front-end badge editor web app and a REST back-end API server for data access for the UI/badges.

Here's a diagram (click to open Miro):
[![Digibadge_architecture170922](https://user-images.githubusercontent.com/42594962/190867248-da39a1ed-51c1-450b-aa64-2f69235e85e9.jpg)](https://miro.com/app/board/uXjVPdtm_zU=/?share_link_id=651121183805)

## Requirements
- a local [MongoDB server](https://www.mongodb.com/docs/manual/installation/)
- a DHCP server on the subnet
- a meaty wireless access point
  - I'm using a UniFi Lite 6
  - if you're running this in a private LAN, make sure to disable any upstream connection monitoring; UniFi APs have this enabled by default and it took me a week to figure out how to turn it off :(
- once installed, a modification to `./client/node_modules/react-scripts/config/webpack.config.js` at the `resolve` tag to fix node polyfill issues, like this:
  ```
    resolve: {
      fallback: {
        "fs": false,
        "http": require.resolve("stream-http"),
        "https": false,
        "zlib": require.resolve("browserify-zlib"),
        "path": require.resolve("path-browserify"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util/"),
        "assert": require.resolve("assert/"),
        "buffer": require.resolve("buffer/"),
      },
  ```
- e-paper digital name badges with wireless LAN capability. I used Waveshare's Pico-ePaper-2.9 and Pico-ePaper-2.9-B, and you can find the drivers and code for using those [here](https://github.com/mhmatthall/badgeboy-picow).

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
- `GET /badges`
    
    returns all badge data for all badges
    
- `GET /badges/by-id/X`
    
    returns all badge data for badge with ID `X`
    
- `GET /badges/by-mac/XXXXXXXXXXXX`
    
    returns all badge data for badge with MAC address `XXXXXXXXXXXX`
    
- `GET /network/devices`
    
    returns IP and MAC for all devices on the LAN
    
- `GET /network/badges`
    
    returns IP and MAC for badges on the LAN
    
- `POST /badges`
    
    creates a new (blank) badge entry on the database with given payload:
    
    ```jsx
    {
    	macAddress: "XXXXXXXXXXXX"
    }
    ```
    
- `PUT /badges/by-id/X`
    
    updates badge with ID `X` with given payload:
    
    ```jsx
    {
    	name: "",
    	pronouns: "",
    	affiliation: "",
    	message: ""
    }
    ```
## Future plans
I intend to occasionally improve this and eventually turn it into an easy all-in-one solution for digital name badges for conferences.

Ideas include:
- Customisable badge graphic designs
- Multiple badge display colours
- Interactivity (games, quiz, etc.)
- Live notifications
- Internet connectivity
- Automatic/easier user management