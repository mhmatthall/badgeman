const express = require('express')
const router = express.Router()
const find = require('local-devices')

const subnetPrefix = '192.168.0.'
const subnetFirstPoolAddressSuffix = '3'
const subnetLastPoolAddressSuffix = '254'
const subnetFirstPoolAddress = subnetPrefix + subnetFirstPoolAddressSuffix
const subnetLastPoolAddress = subnetPrefix + subnetLastPoolAddressSuffix


router.get('/', (req, res, next) => {
    find(
        {
            address: subnetFirstPoolAddress + '-' + subnetLastPoolAddress
        }
    ).then(devices => res.send(devices))

})

module.exports = router