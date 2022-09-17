/*
    Badge manager REST API for the Festival of Ideas 2022
    by Matt Hall
*/
const { json } = require('express')
const express = require('express')
const router = express.Router()
const findDevices = require('local-devices')

// Import models
const Badge = require('../models/Badge')

// Create reusable IP refs
const subnetPrefix = '192.168.0.'
const subnetFirstPoolAddressSuffix = '3'
const subnetLastPoolAddressSuffix = '254'
const subnetFirstPoolAddress = subnetPrefix + subnetFirstPoolAddressSuffix
const subnetLastPoolAddress = subnetPrefix + subnetLastPoolAddressSuffix

// Get all data for all badges
router.get('/badges', async (req, res) => {
    const badges = await Badge.find()

    return res.status(200).json(badges)
})

// Get a badge's MAC address by giving currentID (NOT _id)
router.get('/badges/id2mac/:id', async (req, res) => {
    try {
        // Try and get requested badge
        const b = await Badge.findOne(
            { currentId: req.params.id },
            'currentId macAddress'
        )
        
        if (b == null) {
            // If it doesn't exist
            return res.status(404).json({ error: 'Cannot find badge with ID ' + req.params.id })
        } else {
            // If it does exist
            return res.status(200).json(b)
        }

    } catch (err) {
        // If request is malformed
        return res.status(400).json({ error: err.toString() })
    }
})

// Get all badge data for one badge by MAC address
router.get('/badges/:mac', async (req, res) => {
    try {
        // Try and get requested badge
        const b = await Badge.findOne({ macAddress: req.params.mac })
        
        if (b == null) {
            // If it doesn't exist
            return res.status(404).json({ error: 'Cannot find badge with MAC address ' + req.params.mac })
        } else {
            // If it does exist
            return res.status(200).json(b)
        }

    } catch (err) {
        // If request is malformed
        return res.status(400).json({ error: err.toString() })
    }
})

// Create new badge
//      Expects a POST request to /api/badges in the format:
//      {
//          "macAddress" : "XXXXXXXXXXXX",
//          "name":"X",
//          "pronouns":"X",
//          "affiliation":"X",
//          "message":"X",
//          "image":"X"
//      }
router.post('/badges', async (req, res) => {
    try {
        // Count num of preexisting posts in db to get new badge ID
        const numPosts = await Badge.count()

        // Instantiate new badge
        const b = new Badge({
            currentId: numPosts,
            lastUpdate: Date.now(),
            macAddress: req.body.macAddress,
            userData: {
                name: req.body.name,
                pronouns: req.body.pronouns,
                affiliation: req.body.affiliation,
                message: req.body.message,
                image: req.body.image
            }
        })

        // Write to db and signal completion
        await b.save().then(
            // Okey doke
            res.status(201).end()
        )

    } catch (err) {
        // Nopey broke
        return res.status(500).json({ error: err.toString() })
    }
})

// Update all userData for a badge
//      Expects a PUT request to /api/badges/XXXXXXXXXXXX in the format:
//      {
//          "name":"X",
//          "pronouns":"X",
//          "affiliation":"X",
//          "message":"X",
//          "image":"X"
//      }
router.put('/badges/:mac', async (req, res) => {
    try {
        // Try and get requested badge
        const b = await Badge.findOne({ macAddress: req.params.mac })
        
        if (b == null) {
            // If it doesn't exist
            return res.status(404).json({ error: 'Cannot find badge with MAC address ' + req.params.mac })
        } else {
            // If it does exist, update data
            b.lastUpdate = Date.now()
            b.userData.name = req.body.name
            b.userData.pronouns = req.body.pronouns
            b.userData.affiliation = req.body.affiliation
            b.userData.message = req.body.message
            b.userData.image = req.body.image

            // Write to db and signal completion
            await b.save().then(
                // Okey doke
                res.status(200).end()
            )
        }

    } catch (err) {
        // If request is malformed
        return res.status(400).json({ error: err.toString() })
    }
})

// Get a list of all devices that are connected to the LAN
//      Returns a JSON object in the format:
//      [
//          { "name":"?", "ip":"X.X.X.X", "mac":"xx.xx.xx.xx.xx.xx" }
//          ...
//      ]
router.get('/network', (req, res) => {
    findDevices(
        { address: subnetFirstPoolAddress + '-' + subnetLastPoolAddress }
    ).then(
        // Okey doke
        devices => res.status(200).json(devices)
    ).catch(
        // Nopey broke
        err => res.status(500).json({ error: err.toString() })
    )
})

// Async-compatible filter helper function, equivalent to Array.filter()
// by Gabe Rogan (https://stackoverflow.com/questions/33355528/)
async function filter(arr, callback) {
    const fail = Symbol()
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i=>i!==fail)
}

// Get a list of the badges that are connected to the LAN
//      Returns a JSON object in the format:
//      [
//          { "name":"?", "ip":"X.X.X.X", "mac":"xx.xx.xx.xx.xx.xx" }
//          ...
//      ]
router.get('/network/badges', async (req, res) => {
    try {
        // Search the LAN for devices
        const devices = await findDevices(
            { address: subnetFirstPoolAddress + '-' + subnetLastPoolAddress }
        )

        // Filter the list to devices that are registered as badges
        const badges = await filter(devices, async (device) => {
            // Search the db for a badge with device's MAC address
            const res = await Badge.findOne(
                { macAddress: device.mac.replace(/:/g, '').toUpperCase() },
                'macAddress currentId'
            )
            // Any data in res indicates that it's a badge, so just check not null
            return (res != null)
        })

        // Okey doke
        return res.status(200).json(badges)
    } catch (err) {
        // Nopey broke
        return res.status(500).json({ error: err.toString() })
    }
})

module.exports = router