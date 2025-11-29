const express = require('express')
const router = express.Router()

const UserInfoHandler = require('../router_handle/userinfo')

router.post('/userinfo', UserInfoHandler.getUserInfo)
router.post('/changeName', UserInfoHandler.changeName)



module.exports = router