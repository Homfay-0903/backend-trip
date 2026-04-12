const express = require('express')
const router = express.Router()

const favoriteHandler = require('../router_handle/favorite.js')

router.post('/add', favoriteHandler.addFavorite)
router.get('/list', favoriteHandler.getFavoriteList)
router.delete('/delete/:id', favoriteHandler.deleteFavorite)

module.exports = router
