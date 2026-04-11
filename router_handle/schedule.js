const db = require('../db/index.js')

exports.createSchedule = (req, res) => {
    const scheduleInfo = req.body

    if (!scheduleInfo.trip_id || !scheduleInfo.day_number || !scheduleInfo.date) {
        return res.send({
            status: 1,
            message: '行程ID、天数和日期不能为空'
        })
    }

    const checkTripSql = 'SELECT * FROM trips WHERE id = ?'
    db.query(checkTripSql, scheduleInfo.trip_id, (err, tripResults) => {
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

        const checkDuplicateSql = 'SELECT * FROM schedules WHERE trip_id = ? AND day_number = ?'
        db.query(checkDuplicateSql, [scheduleInfo.trip_id, scheduleInfo.day_number], (err, duplicateResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询日程失败：' + err.message
                })
            }

            if (duplicateResults.length > 0) {
                return res.send({
                    status: 1,
                    message: '该天数的日程已存在，请使用更新功能'
                })
            }

            const sql = 'INSERT INTO schedules SET ?'
            const scheduleData = {
                trip_id: scheduleInfo.trip_id,
                day_number: scheduleInfo.day_number,
                date: scheduleInfo.date,
                morning_activity: scheduleInfo.morning_activity || null,
                afternoon_activity: scheduleInfo.afternoon_activity || null,
                evening_activity: scheduleInfo.evening_activity || null,
                notes: scheduleInfo.notes || null
            }

            db.query(sql, scheduleData, (err, results) => {
                if (err) {
                    return res.send({
                        status: 1,
                        message: '创建日程失败：' + err.message
                    })
                }

                if (results.affectedRows !== 1) {
                    return res.send({
                        status: 1,
                        message: '创建日程失败'
                    })
                }

                const scheduleId = results.insertId
                const querySql = 'SELECT * FROM schedules WHERE id = ?'
                db.query(querySql, scheduleId, (err, scheduleResults) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: '查询日程信息失败'
                        })
                    }

                    res.send({
                        status: 0,
                        message: '创建日程成功',
                        data: {
                            schedule_id: scheduleId,
                            schedule: scheduleResults[0]
                        }
                    })
                })
            })
        })
    })
}

exports.getScheduleList = (req, res) => {
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

        const sql = 'SELECT * FROM schedules WHERE trip_id = ? ORDER BY day_number ASC'
        db.query(sql, trip_id, (err, scheduleResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询日程列表失败：' + err.message
                })
            }

            res.send({
                status: 0,
                message: '获取日程列表成功',
                data: {
                    trip_id: parseInt(trip_id),
                    total: scheduleResults.length,
                    list: scheduleResults
                }
            })
        })
    })
}

exports.updateSchedule = (req, res) => {
    const { id } = req.params
    const updateData = req.body

    if (!id) {
        return res.send({
            status: 1,
            message: '日程ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM schedules WHERE id = ?'
    db.query(checkSql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询日程失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '日程不存在'
            })
        }

        const allowedFields = ['day_number', 'date', 'morning_activity', 'afternoon_activity', 'evening_activity', 'notes']
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

        if (updates.day_number) {
            const schedule = results[0]
            const checkDuplicateSql = 'SELECT * FROM schedules WHERE trip_id = ? AND day_number = ? AND id != ?'
            db.query(checkDuplicateSql, [schedule.trip_id, updates.day_number, id], (err, duplicateResults) => {
                if (err) {
                    return res.send({
                        status: 1,
                        message: '查询日程失败：' + err.message
                    })
                }

                if (duplicateResults.length > 0) {
                    return res.send({
                        status: 1,
                        message: '该天数的日程已存在'
                    })
                }

                performUpdate()
            })
        } else {
            performUpdate()
        }

        function performUpdate() {
            const sql = 'UPDATE schedules SET ? WHERE id = ?'

            db.query(sql, [updates, id], (err, updateResults) => {
                if (err) {
                    return res.send({
                        status: 1,
                        message: '更新日程失败：' + err.message
                    })
                }

                if (updateResults.affectedRows !== 1) {
                    return res.send({
                        status: 1,
                        message: '更新日程失败'
                    })
                }

                const querySql = 'SELECT * FROM schedules WHERE id = ?'
                db.query(querySql, id, (err, scheduleResults) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: '查询更新后的日程信息失败'
                        })
                    }

                    res.send({
                        status: 0,
                        message: '更新日程成功',
                        data: {
                            schedule: scheduleResults[0]
                        }
                    })
                })
            })
        }
    })
}

exports.deleteSchedule = (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.send({
            status: 1,
            message: '日程ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM schedules WHERE id = ?'
    db.query(checkSql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询日程失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '日程不存在'
            })
        }

        const deleteSql = 'DELETE FROM schedules WHERE id = ?'
        db.query(deleteSql, id, (err, deleteResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '删除日程失败：' + err.message
                })
            }

            if (deleteResults.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '删除日程失败'
                })
            }

            res.send({
                status: 0,
                message: '删除日程成功',
                data: {
                    deleted_schedule_id: parseInt(id)
                }
            })
        })
    })
}
