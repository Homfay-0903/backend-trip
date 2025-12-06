const express = require('express')
const router = express.Router()

const UserInfoHandler = require('../router_handle/userinfo')

router.post('/userinfo', UserInfoHandler.getUserInfo)
router.post('/changeName', UserInfoHandler.changeName)
router.post('/changeSex', UserInfoHandler.changeSex)
router.post('/changeEmail', UserInfoHandler.changeEmail)
router.post('/changePassword', UserInfoHandler.changePassword)
router.post('/uploadAvatar', UserInfoHandler.uploadAvatar)


module.exports = router