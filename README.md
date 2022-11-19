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
└── config.ini
└── package-lock.json
└── package.json
└── .github
│   └── workflows
│       └── codeql-analysis.yml
└── api
│   └── app.js
│   └── bin
│   │   └── www
│   └── models
│   │   └── Badge.js
│   └── package-lock.json
│   └── package.json
│   └── public
│   │   └── images
│   │       └── badge_template_blank.png
│   │       └── badge_template_full.png
│   │   └── stylesheets
│   │       └── style.css
│   └── routes
│   │   └── api.js
│   └── views
│       └── error.jade
│       └── layout.jade
└── client
   └── build
   │   └── config.gypi
   └── package-lock.json
   └── package.json
   └── public
   │   └── favicon.ico
   │   └── index.html
   │   └── manifest.json
   │   └── pch_spiral_192.png
   │   └── pch_spiral_512.png
   │   └── robots.txt
   └── src
       └── css
       │   └── index.scss
       └── fonts
       │   └── BetterTimes.woff
       │   └── Cosmos-Light.otf
       │   └── Cosmos-Light.woff
       │   └── Cosmos-Medium.otf
       │   └── Cosmos-Medium.woff
       │   └── fonts.scss
       └── index.jsx
       └── routes
           └── Login.jsx
           └── editor.jsx
           └── error.jsx
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

Definitely adding:
- Faster display updates (currently takes two minutes, I don't know why)
- Containerisation
- Standard image conversion to B/W and display
- A dashboard to view all connected badges

Ideas include:
- Customisable badge graphic designs
- Multiple badge display colours
- Interactivity (games, quiz, etc.)
- Live notifications
- Internet connectivity
- Automatic/easier user management
