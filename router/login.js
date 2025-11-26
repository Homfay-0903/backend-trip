const express = require('express')
const router = express.Router()

//const expressJoi = require('@escook/express-joi')
//const {
//    login_limit
//} = require('../limit/login.js')


const loginHandler = require('../router_handle/login.js')

router.post('/register', loginHandler.register)
router.post('/login', loginHandler.login)


module.exports = router