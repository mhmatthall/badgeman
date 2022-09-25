/*
    badgeman REST API
    by Matt Hall
*/
const { createCanvas, loadImage, Image } = require("canvas");
const express = require("express");
const fs = require("fs");
const ini = require("ini");
const findDevices = require("local-devices");
const md5 = require("md5");
const qr = require("qrcode");
const router = express.Router();

// Import INI file from project root
const config = ini.parse(
  fs.readFileSync(__dirname + "/../../config.ini", "utf8")
);

// Import models
const Badge = require("../models/Badge");

// Update the badge image given a badge's mac -- choosing to either:
//  - render an instructions page for blank badges
//  - render the proper badge layout for badges with user data
async function updateBadge(macAddress) {
  // Try and get requested badge
  const b = await Badge.findOne({ macAddress: macAddress });

  // If fetch unsuccessful then just exit fn
  if (b == null) {
    return null;
  } else {
    // Consider no name in userData as indicating a blank badge
    const isBadgeBlank = b.userData.name === "";

    // Handoff to appropriate render function
    isBadgeBlank ? await renderBlankBadge(b) : await renderFullBadge(b);
  }
}

async function renderBlankBadge(badge) {
  // Create base canvas and context
  const cv = createCanvas(296, 128);
  const ctx = cv.getContext("2d");

  // Generate secret to display
  const secret = md5(badge.currentId.toString()).substring(0, 5);

  // Grab base blank badge template image
  const baseImg = await loadImage(
    `http://${config.HOST_IP_ADDRESS}:${config.API_PORT}/images/badge_template_blank.png`
  );

  // Generate QR code dataUrl (default size is 132x132px -- 100x100px QR with 16px border)
  const qrCode = await qr.toDataURL(
    `http://${config.HOST_IP_ADDRESS}:${config.CLIENT_PORT}`
  );

  // Load as image
  const qrCodeImg = await loadImage(qrCode);

  // ADD BADGE CONTENT
  // Draw base image on canvas
  ctx.drawImage(baseImg, 0, 0, 296, 128);

  // ctx.drawImage(qrCodeImg, 110, 45, 90, 90);
  ctx.drawImage(qrCodeImg, 16, 16, 100, 100, 113, 51, 70, 70);

  // Set text style
  ctx.textAlign = "center";
  ctx.font = 'bold 16px "Fira Code"';

  // I'm using few variables here to reduce the line count of this text draw
  // Insert SSID text
  if (ctx.measureText(config.network.SSID).width > 55) {
    // If name is too long, split over two lines at first whitespace
    const ssidText = config.network.SSID.split(/ (.*)/s);
    ctx.fillText(ssidText[0], 51, 94);
    ctx.fillText(ssidText[1], 51, 112);
  } else {
    // Name fits on one line, don't change
    ctx.fillText(config.network.SSID, 51, 94);
  }

  // Insert badge secret text
  ctx.fillText(secret, 245, 113);

  ctx.font = 'bold 18px "Fira Code"';

  // Insert badge ID text
  ctx.fillText(badge.currentId, 260, 69);

  // Apply pre-processing for badge display
  badge.userData.image = await preProcess(cv, ctx);

  await badge.save();
}

async function renderFullBadge(badge) {
  // Create base canvas and context
  const cv = createCanvas(296, 128);
  const ctx = cv.getContext("2d");

  // Grab base badge template image
  const baseImg = await loadImage(
    `http://${config.HOST_IP_ADDRESS}:${config.API_PORT}/images/badge_template_full.png`
  );

  // ADD BADGE CONTENT
  // Draw base image on canvas
  ctx.drawImage(baseImg, 0, 0, 296, 128);

  // Bigger name font size
  ctx.font = '36px "Cosmos"';

  // Check width to make sure it hasn't spilt
  if (ctx.measureText(badge.userData.name).width <= 192) {
    // Name fits on one line at 36px, draw
    ctx.fillText(badge.userData.name, 10, 36);
  } else {
    // Smaller name font size
    ctx.font = '24px "Cosmos"';

    // Check width to make sure it hasn't spilt onto profile image
    if (ctx.measureText(badge.userData.name).width <= 192) {
      // Name fits on one line at 24px, draw
      ctx.fillText(badge.userData.name, 10, 28);
    } else {
      // If name is still too long, split over two lines at first whitespace
      const nameArr = badge.userData.name.split(/ (.*)/s);
      ctx.fillText(nameArr[0], 10, 28);
      ctx.fillText(nameArr[1], 10, 54);
    }
  }

  ctx.font = '17px "Cosmos Light"';
  ctx.fillText(badge.userData.pronouns, 10, 76);

  ctx.font = '17px "Cosmos"';
  ctx.fillText(badge.userData.affiliation, 10, 96);

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText(badge.userData.message, 148, 124);

  // Apply pre-processing for badge display
  badge.userData.image = await preProcess(cv, ctx);

  await badge.save();
}

async function preProcess(cv, ctx) {
  // IMAGE PRE-PROCESSING FOR BADGE DISPLAY MODULE
  //    Uses lots of the rotation code written by Gustavo Carvalho for SO:
  //    https://stackoverflow.com/questions/16645801/

  // Copy current image state to temp var
  let originalImg = await loadImage(cv.toDataURL());

  // Save original width/height
  let cw = cv.width;
  let ch = cv.height;

  // Reset canvas layout to new dimensions
  cv.width = ch;
  cv.height = cw;
  cw = cv.width;
  ch = cv.height;
  ctx.save();

  // Translate and rotate canvas 90deg
  ctx.translate(cw, ch / cw);
  ctx.rotate(Math.PI / 2);

  // Draw the original image, now rotated
  ctx.drawImage(originalImg, 0, 0);
  ctx.restore();

  // Export the canvas as a raw array of pixels (RGBA)
  const rawImg = ctx.getImageData(0, 0, cv.width, cv.height).data;

  // Compress image as to not overwhelm badge memory
  return compress(rawImg);
}

/**
  Compress an image expressed as a raw array of RGBA values into a single hex string.

  @param {Array} rawImg A 1D array of integers in the format `[R0,G0,B0,A0,R1,G1,B1,A1,...]` where
  Rx, Gx, Bx, Ax are in the range `[0-256)`.
  
  @return {String} A string of hex chars of length `(rawImg / 16)`.
    
*/
function compress(rawImg) {
  // STEP 1: CONVERT TO BITSTRING WITH EFFECTIVE SIZE (WIDTH x HEIGHT) BYTES
  let pixels = [];

  // Take the average of the RGB colour values (ignoring A) and threshold to 0 or 1
  for (i = 0; i < rawImg.length; i = i + 4) {
    let avgColour = (rawImg[i] + rawImg[i + 1] + rawImg[i + 2]) / 3;

    // Avg colours <128 get assigned white, >128 black
    avgColour < 128 ? pixels.push(0) : pixels.push(1);
  }

  let pixelsBin = pixels.join("");
  let pixelsHex = [];

  // STEP 2: CONVERT TO HEX CSV LIST WITH EFFECTIVE SIZE (WIDTH x HEIGHT) / 8 BYTES
  for (i = 0; i < pixelsBin.length; i = i + 8) {
    // Read next 8 bits as a binary number, then convert to hex
    let hex = parseInt(pixelsBin.substring(i, i + 8), (radix = 2)).toString(
      (radix = 16)
    );

    // Prepend 0 if hex value < 0xf to ensure two char representation (e.g. '0e' instead of 'e')
    if (hex.length == 1) {
      hex = "0" + hex;
    }

    // Push to array
    pixelsHex.push(hex);
  }

  // Condense hex array into a single string
  return pixelsHex.join("");
}

// Get all data for all badges
router.get("/badges", async (req, res) => {
  try {
    const badges = await Badge.find();
    return res.status(200).json(badges);
  } catch (err) {
    // This should always work, so it'd be a 500 if something went wrong
    return res.status(500).json({ error: err.toString() });
  }
});

// Get all badge data for one badge by ID
router.get("/badges/by-id/:id", async (req, res) => {
  try {
    // Try and get requested badge
    const b = await Badge.findOne({ currentId: req.params.id });

    if (b == null) {
      // If it doesn't exist
      return res.status(404).json({
        error: "Cannot find badge with ID " + req.params.id,
      });
    } else {
      // If it does exist
      return res.status(200).json(b);
    }
  } catch (err) {
    // If request is malformed
    return res.status(400).json({ error: err.toString() });
  }
});

// Get all badge data for one badge by MAC address
router.get("/badges/by-mac/:mac", async (req, res) => {
  try {
    // Try and get requested badge
    const b = await Badge.findOne({ macAddress: req.params.mac });

    if (b == null) {
      // If it doesn't exist
      return res.status(404).json({
        error: "Cannot find badge with MAC address " + req.params.mac,
      });
    } else {
      // If it does exist
      return res.status(200).json(b);
    }
  } catch (err) {
    // If request is malformed
    return res.status(400).json({ error: err.toString() });
  }
});

// Create new badge
//      Expects a POST request to /api/badges in the format:
//      {
//          "macAddress" : "XXXXXXXXXXXX"
//      }
router.post("/badges", async (req, res) => {
  try {
    // Count num of preexisting posts in db to get new badge ID
    const numPosts = await Badge.count();

    // Instantiate new badge
    const b = new Badge({
      currentId: numPosts,
      lastUpdate: Date.now(),
      macAddress: req.body.macAddress,
      userData: {
        name: "",
        pronouns: "",
        affiliation: "",
        message: "",
      },
    });

    // Write to db and signal completion
    await b.save();

    if (b == null) {
      // Save didn't work!
      return res.status(500).json({ error: err.toString() });
    } else {
      // Save worked, server returned saved object
      // Render a badge image for the new badge
      await updateBadge(req.body.macAddress);

      return res.status(201).end();
    }
  } catch (err) {
    // Nopey broke
    return res.status(500).json({ error: err.toString() });
  }
});

// Update all userData for a badge
//      Expects a PUT request to /api/badges/XXXXXXXXXXXX in the format:
//      {
//          "name":"X",
//          "pronouns":"X",
//          "affiliation":"X",
//          "message":"X"
//      }
router.put("/badges/by-id/:id", async (req, res) => {
  try {
    // Try and get requested badge
    const b = await Badge.findOne({ currentId: req.params.id });

    if (b == null) {
      // If it doesn't exist
      return res.status(404).json({
        error: "Cannot find badge with ID " + req.params.id,
      });
    } else {
      // If it does exist, update data
      b.lastUpdate = Date.now();
      b.userData.name = req.body.name;
      b.userData.pronouns = req.body.pronouns;
      b.userData.affiliation = req.body.affiliation;
      b.userData.message = req.body.message;

      // Store mac before save
      const macAddress = b.macAddress;
      
      // Write to db and signal completion
      await b.save().then(async () => {
        // Render badge image with new data
        await updateBadge(macAddress)

        // Okey doke
        res.status(200).end()
      });
    }
  } catch (err) {
    // If request is malformed
    return res.status(400).json({ error: err.toString() });
  }
});

// Get a list of all devices that are connected to the LAN
//      Returns a JSON object in the format:
//      [
//          { "name":"?", "ip":"X.X.X.X", "mac":"xx.xx.xx.xx.xx.xx" }
//          ...
//      ]
router.get("/network", (req, res) => {
  findDevices({
    address:
      config.FIRST_UNUSED_SUBNET_ADDRESS +
      "-" +
      config.LAST_UNUSED_SUBNET_ADDRESS,
  })
    .then(
      // Okey doke
      (devices) => res.status(200).json(devices)
    )
    .catch(
      // Nopey broke
      (err) => res.status(500).json({ error: err.toString() })
    );
});

// Async-compatible filter helper function, equivalent to Array.filter()
// by Gabe Rogan (https://stackoverflow.com/questions/33355528/)
async function filter(arr, callback) {
  const fail = Symbol();
  return (
    await Promise.all(
      arr.map(async (item) => ((await callback(item)) ? item : fail))
    )
  ).filter((i) => i !== fail);
}

// Get a list of the badges that are connected to the LAN
//      Returns a JSON object in the format:
//      [
//          { "name":"?", "ip":"X.X.X.X", "mac":"xx.xx.xx.xx.xx.xx" }
//          ...
//      ]
router.get("/network/badges", async (req, res) => {
  try {
    // Search the LAN for devices
    const devices = await findDevices({
      address:
        config.FIRST_UNUSED_SUBNET_ADDRESS +
        "-" +
        config.LAST_UNUSED_SUBNET_ADDRESS,
    });

    // Filter the list to devices that are registered as badges
    const badges = await filter(devices, async (device) => {
      // Search the db for a badge with device's MAC address
      const res = await Badge.findOne(
        { macAddress: device.mac.replace(/:/g, "").toUpperCase() },
        "macAddress currentId"
      );
      // Any data in res indicates that it's a badge, so just check not null
      return res != null;
    });

    // Okey doke
    return res.status(200).json(badges);
  } catch (err) {
    // Nopey broke
    return res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
