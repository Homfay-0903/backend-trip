const express = require('express')
const router = express.Router()

const expenseHandler = require('../router_handle/expense.js')

router.post('/create', expenseHandler.createExpense)
router.get('/list/:trip_id', expenseHandler.getExpenseList)
router.get('/statistics/:trip_id', expenseHandler.getExpenseStatistics)
router.put('/update/:id', expenseHandler.updateExpense)
router.delete('/delete/:id', expenseHandler.deleteExpense)

module.exports = router
