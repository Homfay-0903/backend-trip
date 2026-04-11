const db = require('../db/index.js')
const crypto = require('crypto')

exports.createTrip = (req, res) => {
    const tripInfo = req.body

    if (!tripInfo.user_id || !tripInfo.trip_name || !tripInfo.destination) {
        return res.send({
            status: 1,
            message: '用户ID、行程名称和目的地不能为空'
        })
    }

    if (tripInfo.start_date && tripInfo.end_date) {
        const startDate = new Date(tripInfo.start_date)
        const endDate = new Date(tripInfo.end_date)
        if (endDate < startDate) {
            return res.send({
                status: 1,
                message: '结束日期不能早于开始日期'
            })
        }
    }

    const sql = 'insert into trips set ?'
    const tripData = {
        user_id: tripInfo.user_id,
        trip_name: tripInfo.trip_name,
        origin: tripInfo.origin || null,
        destination: tripInfo.destination,
        start_date: tripInfo.start_date || null,
        end_date: tripInfo.end_date || null,
        travelers: tripInfo.travelers || 1,
        budget: tripInfo.budget || null,
        transport: tripInfo.transport || null,
        status: 'planning'
    }

    db.query(sql, tripData, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '创建行程失败：' + err.message
            })
        }

        if (results.affectedRows !== 1) {
            return res.send({
                status: 1,
                message: '创建行程失败'
            })
        }

        const tripId = results.insertId
        const querySql = 'select * from trips where id = ?'
        db.query(querySql, tripId, (err, tripResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询行程信息失败'
                })
            }

            res.send({
                status: 0,
                message: '创建行程成功',
                data: {
                    trip_id: tripId,
                    trip: tripResults[0]
                }
            })
        })
    })
}

exports.getTripList = (req, res) => {
    const { user_id, page = 1, page_size = 10, status } = req.query

    if (!user_id) {
        return res.send({
            status: 1,
            message: '用户ID不能为空'
        })
    }

    const pageNum = parseInt(page)
    const pageSizeNum = parseInt(page_size)
    const offset = (pageNum - 1) * pageSizeNum

    let countSql = 'SELECT COUNT(*) as total FROM trips WHERE user_id = ?'
    let querySql = 'SELECT * FROM trips WHERE user_id = ?'
    const params = [user_id]
    const queryParams = [user_id]

    if (status) {
        countSql += ' AND status = ?'
        querySql += ' AND status = ?'
        params.push(status)
        queryParams.push(status)
    }

    querySql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    queryParams.push(pageSizeNum, offset)

    db.query(countSql, params, (err, countResults) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询行程总数失败：' + err.message
            })
        }

        const total = countResults[0].total
        const totalPages = Math.ceil(total / pageSizeNum)

        db.query(querySql, queryParams, (err, tripResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询行程列表失败：' + err.message
                })
            }

            res.send({
                status: 0,
                message: '获取行程列表成功',
                data: {
                    list: tripResults,
                    pagination: {
                        page: pageNum,
                        page_size: pageSizeNum,
                        total,
                        total_pages: totalPages
                    }
                }
            })
        })
    })
}

exports.getTripDetail = (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.send({
            status: 1,
            message: '行程ID不能为空'
        })
    }

    const tripSql = 'SELECT * FROM trips WHERE id = ?'

    db.query(tripSql, id, (err, tripResults) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询行程信息失败：' + err.message
            })
        }

        if (tripResults.length === 0) {
            return res.send({
                status: 1,
                message: '行程不存在'
            })
        }

        const trip = tripResults[0]

        const scheduleSql = 'SELECT * FROM schedules WHERE trip_id = ? ORDER BY day_number ASC'

        db.query(scheduleSql, id, (err, scheduleResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询日程信息失败：' + err.message
                })
            }

            const expenseSql = `
                SELECT 
                    category,
                    COUNT(*) as count,
                    SUM(amount) as total_amount
                FROM expenses 
                WHERE trip_id = ? 
                GROUP BY category
            `

            db.query(expenseSql, id, (err, expenseResults) => {
                if (err) {
                    return res.send({
                        status: 1,
                        message: '查询支出信息失败：' + err.message
                    })
                }

                const totalExpense = expenseResults.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0)

                const expenseStats = {
                    total: totalExpense,
                    budget: trip.budget,
                    remaining: trip.budget ? (trip.budget - totalExpense) : null,
                    by_category: expenseResults
                }

                res.send({
                    status: 0,
                    message: '获取行程详情成功',
                    data: {
                        trip: trip,
                        schedules: scheduleResults,
                        expense_stats: expenseStats
                    }
                })
            })
        })
    })
}

exports.updateTrip = (req, res) => {
    const { id } = req.params
    const updateData = req.body

    if (!id) {
        return res.send({
            status: 1,
            message: '行程ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM trips WHERE id = ?'
    db.query(checkSql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询行程失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '行程不存在'
            })
        }

        const allowedFields = ['trip_name', 'origin', 'destination', 'start_date', 'end_date', 'travelers', 'budget', 'transport', 'status']
        const updates = {}

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updates[field] = updateData[field]
            }
        })

        if (Object.keys(updates).length === 0) {
            return res.send({
                status: 1,
                message: '没有需要更新的字段'
            })
        }

        if (updates.start_date && updates.end_date) {
            const startDate = new Date(updates.start_date)
            const endDate = new Date(updates.end_date)
            if (endDate < startDate) {
                return res.send({
                    status: 1,
                    message: '结束日期不能早于开始日期'
                })
            }
        }

        const sql = 'UPDATE trips SET ? WHERE id = ?'

        db.query(sql, [updates, id], (err, updateResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '更新行程失败：' + err.message
                })
            }

            if (updateResults.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '更新行程失败'
                })
            }

            const querySql = 'SELECT * FROM trips WHERE id = ?'
            db.query(querySql, id, (err, tripResults) => {
                if (err) {
                    return res.send({
                        status: 1,
                        message: '查询更新后的行程信息失败'
                    })
                }

                res.send({
                    status: 0,
                    message: '更新行程成功',
                    data: {
                        trip: tripResults[0]
                    }
                })
            })
        })
    })
}

exports.deleteTrip = (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.send({
            status: 1,
            message: '行程ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM trips WHERE id = ?'
    db.query(checkSql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询行程失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '行程不存在'
            })
        }

        const deleteSchedules = 'DELETE FROM schedules WHERE trip_id = ?'
        db.query(deleteSchedules, id, (err) => {
            if (err) {
                console.error('删除日程失败：', err.message)
            }
        })

        const deleteExpenses = 'DELETE FROM expenses WHERE trip_id = ?'
        db.query(deleteExpenses, id, (err) => {
            if (err) {
                console.error('删除支出记录失败：', err.message)
            }
        })

        const deleteReminders = 'DELETE FROM reminders WHERE trip_id = ?'
        db.query(deleteReminders, id, (err) => {
            if (err) {
                console.error('删除提醒失败：', err.message)
            }
        })

        const deleteSql = 'DELETE FROM trips WHERE id = ?'
        db.query(deleteSql, id, (err, deleteResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '删除行程失败：' + err.message
                })
            }

            if (deleteResults.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '删除行程失败'
                })
            }

            res.send({
                status: 0,
                message: '删除行程成功',
                data: {
                    deleted_trip_id: parseInt(id)
                }
            })
        })
    })
}

exports.shareTrip = (req, res) => {
    const { trip_id } = req.body

    if (!trip_id) {
        return res.send({
            status: 1,
            message: '行程ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM trips WHERE id = ?'
    db.query(checkSql, trip_id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询行程失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '行程不存在'
            })
        }

        const trip = results[0]
        const shareCode = crypto.randomBytes(8).toString('hex')
        const shareUrl = `http://127.0.0.1:3000/trip/share/${shareCode}`

        const shareData = {
            share_code: shareCode,
            share_url: shareUrl,
            trip_id: trip_id,
            trip_name: trip.trip_name,
            destination: trip.destination,
            start_date: trip.start_date,
            end_date: trip.end_date,
            created_at: new Date().toISOString()
        }

        res.send({
            status: 0,
            message: '生成分享链接成功',
            data: shareData
        })
    })
}
