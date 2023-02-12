# badgeman
A standalone, offline digital name badge management server designed for use in large special events.

**NOTE: This project is extremely WIP and so expect frequent breaking changes! A release will be made when things are a bit more settled.**

## Architecture
This version of the app is designed to be run entirely locally on a private subnet. It incorporates a web server for the front-end badge editor web app and a REST back-end API server for data access for the UI/badges.

Here's a diagram (click to open in Miro):
[![badgeman_arch_feb23](https://user-images.githubusercontent.com/42594962/218265791-4993ea90-c131-4be2-8d81-616e6238a19f.jpg)](https://miro.com/app/board/uXjVPdtm_zU=/?share_link_id=651121183805)

## Repo structure
Simplified to illustrate where the core files are. The Express back-end lives at `./api` and the React front-end at `./client`.
```
.
└── config.ini
└── package.json
└── api
│   └── app.js
│   └── package.json
│   └── bin
│   └── models
│   └── public
│   └── routes
│   │   └── api.js
│   └── views
└── client
   └── package.json
   └── build
   └── public
   │   └── index.html
   └── src
       └── css
       └── fonts
       └── index.jsx
       └── routes
           └── Login.jsx
           └── editor.jsx
           └── error.jsx
```

## Prerequisites
### For the WLAN:
- a meaty wireless access point that can handle your client numbers
  - I'm using a UniFi Lite 6
  - Make sure to disable any upstream connection monitoring; UniFi APs have this enabled by default and it took me a week to figure out how to turn it off :(

### For the host server:
- a local [MongoDB server](https://www.mongodb.com/docs/manual/installation/)
- a DHCP server
  - I'm using [dhcpsrv](https://www.dhcpserver.de/cms/) for Windows right now because it's easy; [I've included config files for this](./configs/dhcpsrv/)
  - This **will** change when this project is containerised

### For the badges:
- a WiFi-enabled microcontroller to communicate with the network and control the display
  - I'm using Raspberry Pi Pico W flashed with MicroPython binaries; [my controller code here](https://github.com/mhmatthall/badgeboy-picow/blob/main/src/main.py)
- e-paper digital name badges
  - I'm using Waveshare Pico-ePaper-2.9 and Pico-ePaper-2.9-B because they were the ones in stock and within budget; [see this repo for my drivers](https://github.com/mhmatthall/badgeboy-picow)

## Installation
- clone the repo
- run `npm install`
- once complete, we need to patch some JS polyfill issues -- edit `./client/node_modules/react-scripts/config/webpack.config.js` at the `resolve` tag, like this:
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
[Check out the 2023 roadmap thread in the discussions!](https://github.com/mhmatthall/badgeman/discussions/4)
