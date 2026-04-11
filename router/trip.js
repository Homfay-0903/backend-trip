const express = require('express')
const router = express.Router()

const tripHandler = require('../router_handle/trip.js')

router.post('/create', tripHandler.createTrip)
router.get('/list', tripHandler.getTripList)
router.get('/detail/:id', tripHandler.getTripDetail)
router.put('/update/:id', tripHandler.updateTrip)
router.delete('/delete/:id', tripHandler.deleteTrip)
router.post('/share', tripHandler.shareTrip)

module.exports = router
