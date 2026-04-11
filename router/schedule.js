const express = require('express')
const router = express.Router()

const scheduleHandler = require('../router_handle/schedule.js')

router.post('/create', scheduleHandler.createSchedule)
router.get('/list/:trip_id', scheduleHandler.getScheduleList)
router.put('/update/:id', scheduleHandler.updateSchedule)
router.delete('/delete/:id', scheduleHandler.deleteSchedule)

module.exports = router
