const express = require('express')
const router = express.Router()

const reminderHandler = require('../router_handle/reminder.js')

router.post('/create', reminderHandler.createReminder)
router.get('/list', reminderHandler.getReminderList)
router.put('/update/:id', reminderHandler.updateReminder)
router.delete('/delete/:id', reminderHandler.deleteReminder)

module.exports = router
