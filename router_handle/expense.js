const db = require('../db/index.js')

const categoryMap = {
    '交通': 'transport',
    '住宿': 'accommodation',
    '餐饮': 'food',
    '门票': 'ticket',
    '购物': 'shopping',
    '娱乐': 'other',
    '其他': 'other',
    'transport': 'transport',
    'accommodation': 'accommodation',
    'food': 'food',
    'ticket': 'ticket',
    'shopping': 'shopping',
    'other': 'other'
}

const categoryReverseMap = {
    'transport': '交通',
    'accommodation': '住宿',
    'food': '餐饮',
    'ticket': '门票',
    'shopping': '购物',
    'other': '其他'
}

exports.createExpense = (req, res) => {
    const expenseInfo = req.body

    if (!expenseInfo.trip_id || !expenseInfo.category || !expenseInfo.amount || !expenseInfo.expense_date) {
        return res.send({
            status: 1,
            message: '行程ID、分类、金额和日期不能为空'
        })
    }

    const category = categoryMap[expenseInfo.category]
    if (!category) {
        return res.send({
            status: 1,
            message: '支出分类无效，支持的分类：交通/住宿/餐饮/门票/购物/娱乐/其他'
        })
    }

    const checkTripSql = 'SELECT * FROM trips WHERE id = ?'
    db.query(checkTripSql, expenseInfo.trip_id, (err, tripResults) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询行程失败：' + err.message
            })
        }

        if (tripResults.length === 0) {
            return res.send({
                status: 1,
                message: '行程不存在'
            })
        }

        const sql = 'INSERT INTO expenses SET ?'
        const expenseData = {
            trip_id: expenseInfo.trip_id,
            category: category,
            amount: expenseInfo.amount,
            description: expenseInfo.description || null,
            expense_date: expenseInfo.expense_date
        }

        db.query(sql, expenseData, (err, results) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '记录支出失败：' + err.message
                })
            }

            if (results.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '记录支出失败'
                })
            }

            const expenseId = results.insertId
            const querySql = 'SELECT * FROM expenses WHERE id = ?'
            db.query(querySql, expenseId, (err, expenseResults) => {
                if (err) {
                    return res.send({
                        status: 1,
                        message: '查询支出信息失败'
                    })
                }

                res.send({
                    status: 0,
                    message: '记录支出成功',
                    data: {
                        expense_id: expenseId,
                        expense: expenseResults[0]
                    }
                })
            })
        })
    })
}

exports.getExpenseList = (req, res) => {
    const { trip_id } = req.params
    const { category } = req.query

    if (!trip_id) {
        return res.send({
            status: 1,
            message: '行程ID不能为空'
        })
    }

    const checkTripSql = 'SELECT * FROM trips WHERE id = ?'
    db.query(checkTripSql, trip_id, (err, tripResults) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询行程失败：' + err.message
            })
        }

        if (tripResults.length === 0) {
            return res.send({
                status: 1,
                message: '行程不存在'
            })
        }

        let sql = 'SELECT * FROM expenses WHERE trip_id = ?'
        const params = [trip_id]

        if (category) {
            const categoryValue = categoryMap[category]
            if (categoryValue) {
                sql += ' AND category = ?'
                params.push(categoryValue)
            }
        }

        sql += ' ORDER BY expense_date DESC, created_at DESC'

        db.query(sql, params, (err, expenseResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询支出列表失败：' + err.message
                })
            }

            const expenses = expenseResults.map(expense => ({
                ...expense,
                category_cn: categoryReverseMap[expense.category] || expense.category
            }))

            const statisticsSql = `
                SELECT 
                    category,
                    COUNT(*) as count,
                    SUM(amount) as total_amount
                FROM expenses 
                WHERE trip_id = ?
                GROUP BY category
            `

            db.query(statisticsSql, trip_id, (err, statsResults) => {
                if (err) {
                    return res.send({
                        status: 1,
                        message: '查询支出统计失败：' + err.message
                    })
                }

                const categoryStats = statsResults.map(stat => ({
                    category: stat.category,
                    category_cn: categoryReverseMap[stat.category] || stat.category,
                    count: stat.count,
                    total_amount: parseFloat(stat.total_amount)
                }))

                const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)

                res.send({
                    status: 0,
                    message: '获取支出列表成功',
                    data: {
                        trip_id: parseInt(trip_id),
                        total: expenses.length,
                        total_amount: totalAmount,
                        list: expenses,
                        category_statistics: categoryStats
                    }
                })
            })
        })
    })
}

exports.getExpenseStatistics = (req, res) => {
    const { trip_id } = req.params

    if (!trip_id) {
        return res.send({
            status: 1,
            message: '行程ID不能为空'
        })
    }

    const checkTripSql = 'SELECT * FROM trips WHERE id = ?'
    db.query(checkTripSql, trip_id, (err, tripResults) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询行程失败：' + err.message
            })
        }

        if (tripResults.length === 0) {
            return res.send({
                status: 1,
                message: '行程不存在'
            })
        }

        const trip = tripResults[0]
        const budget = parseFloat(trip.budget) || 0

        const totalSql = 'SELECT COALESCE(SUM(amount), 0) as total_amount FROM expenses WHERE trip_id = ?'

        db.query(totalSql, trip_id, (err, totalResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询支出总额失败：' + err.message
                })
            }

            const totalAmount = parseFloat(totalResults[0].total_amount)

            const categorySql = `
                SELECT 
                    category,
                    COUNT(*) as count,
                    SUM(amount) as total_amount
                FROM expenses 
                WHERE trip_id = ?
                GROUP BY category
                ORDER BY total_amount DESC
            `

            db.query(categorySql, trip_id, (err, categoryResults) => {
                if (err) {
                    return res.send({
                        status: 1,
                        message: '查询分类统计失败：' + err.message
                    })
                }

                const categoryStats = categoryResults.map(stat => {
                    const amount = parseFloat(stat.total_amount)
                    const percentage = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(2) : 0

                    return {
                        category: stat.category,
                        category_cn: categoryReverseMap[stat.category] || stat.category,
                        count: stat.count,
                        total_amount: amount,
                        percentage: parseFloat(percentage)
                    }
                })

                const budgetRemaining = budget - totalAmount
                const budgetPercentage = budget > 0 ? ((totalAmount / budget) * 100).toFixed(2) : 0

                const dailySql = `
                    SELECT 
                        expense_date,
                        COUNT(*) as count,
                        SUM(amount) as total_amount
                    FROM expenses 
                    WHERE trip_id = ?
                    GROUP BY expense_date
                    ORDER BY expense_date ASC
                `

                db.query(dailySql, trip_id, (err, dailyResults) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: '查询每日统计失败：' + err.message
                        })
                    }

                    const dailyStats = dailyResults.map(stat => ({
                        date: stat.expense_date,
                        count: stat.count,
                        total_amount: parseFloat(stat.total_amount)
                    }))

                    res.send({
                        status: 0,
                        message: '获取支出统计成功',
                        data: {
                            trip_id: parseInt(trip_id),
                            trip_name: trip.trip_name,
                            budget: budget,
                            total_expense: totalAmount,
                            budget_remaining: budgetRemaining,
                            budget_usage_percentage: parseFloat(budgetPercentage),
                            is_over_budget: totalAmount > budget,
                            category_statistics: categoryStats,
                            daily_statistics: dailyStats
                        }
                    })
                })
            })
        })
    })
}

exports.updateExpense = (req, res) => {
    const { id } = req.params
    const updateData = req.body

    if (!id) {
        return res.send({
            status: 1,
            message: '支出ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM expenses WHERE id = ?'
    db.query(checkSql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询支出记录失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '支出记录不存在'
            })
        }

        const allowedFields = ['category', 'amount', 'description', 'expense_date']
        const updates = {}

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                if (field === 'category') {
                    const categoryValue = categoryMap[updateData[field]]
                    if (!categoryValue) {
                        return res.send({
                            status: 1,
                            message: '支出分类无效，支持的分类：交通/住宿/餐饮/门票/购物/娱乐/其他'
                        })
                    }
                    updates[field] = categoryValue
                } else {
                    updates[field] = updateData[field]
                }
            }
        })

        if (Object.keys(updates).length === 0) {
            return res.send({
                status: 1,
                message: '没有需要更新的字段'
            })
        }

        const sql = 'UPDATE expenses SET ? WHERE id = ?'

        db.query(sql, [updates, id], (err, updateResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '更新支出记录失败：' + err.message
                })
            }

            if (updateResults.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '更新支出记录失败'
                })
            }

            const querySql = 'SELECT * FROM expenses WHERE id = ?'
            db.query(querySql, id, (err, expenseResults) => {
                if (err) {
                    return res.send({
                        status: 1,
                        message: '查询更新后的支出信息失败'
                    })
                }

                const expense = {
                    ...expenseResults[0],
                    category_cn: categoryReverseMap[expenseResults[0].category] || expenseResults[0].category
                }

                res.send({
                    status: 0,
                    message: '更新支出记录成功',
                    data: {
                        expense: expense
                    }
                })
            })
        })
    })
}

exports.deleteExpense = (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.send({
            status: 1,
            message: '支出ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM expenses WHERE id = ?'
    db.query(checkSql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询支出记录失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '支出记录不存在'
            })
        }

        const deleteSql = 'DELETE FROM expenses WHERE id = ?'
        db.query(deleteSql, id, (err, deleteResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '删除支出记录失败：' + err.message
                })
            }

            if (deleteResults.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '删除支出记录失败'
                })
            }

            res.send({
                status: 0,
                message: '删除支出记录成功',
                data: {
                    deleted_expense_id: parseInt(id)
                }
            })
        })
    })
}
