const express = require('express')
const router = express.Router()

const travelLogHandler = require('../router_handle/travellog.js')

router.post('/create', travelLogHandler.createTravelLog)
router.get('/list', travelLogHandler.getTravelLogList)
router.get('/detail/:id', travelLogHandler.getTravelLogDetail)
router.post('/like/:id', travelLogHandler.likeTravelLog)
router.delete('/delete/:id', travelLogHandler.deleteTravelLog)

module.exports = router
