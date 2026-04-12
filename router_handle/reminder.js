const db = require('../db/index.js')

exports.createReminder = (req, res) => {
    const reminderInfo = req.body

    if (!reminderInfo.user_id || !reminderInfo.reminder_type || !reminderInfo.reminder_time) {
        return res.send({
            status: 1,
            message: '用户ID、提醒类型和提醒时间不能为空'
        })
    }

    const validTypes = ['departure', 'weather', 'schedule', 'custom']
    if (!validTypes.includes(reminderInfo.reminder_type)) {
        return res.send({
            status: 1,
            message: '提醒类型不合法，必须是：departure/weather/schedule/custom'
        })
    }

    if (reminderInfo.trip_id) {
        const checkTripSql = 'SELECT * FROM trips WHERE id = ?'
        db.query(checkTripSql, reminderInfo.trip_id, (err, tripResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询行程失败：' + err.message
                })
            }

            if (tripResults.length === 0) {
                return res.send({
                    status: 1,
                    message: '关联的行程不存在'
                })
            }

            insertReminder(reminderInfo, res)
        })
    } else {
        insertReminder(reminderInfo, res)
    }
}

function insertReminder(reminderInfo, res) {
    const sql = 'INSERT INTO reminders SET ?'
    const reminderData = {
        user_id: reminderInfo.user_id,
        trip_id: reminderInfo.trip_id || null,
        reminder_type: reminderInfo.reminder_type,
        reminder_time: reminderInfo.reminder_time,
        content: reminderInfo.content || null,
        is_sent: 0
    }

    db.query(sql, reminderData, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '创建提醒失败：' + err.message
            })
        }

        if (results.affectedRows !== 1) {
            return res.send({
                status: 1,
                message: '创建提醒失败'
            })
        }

        const querySql = `
            SELECT 
                r.*,
                t.trip_name,
                t.destination
            FROM reminders r
            LEFT JOIN trips t ON r.trip_id = t.id
            WHERE r.id = ?
        `

        db.query(querySql, results.insertId, (err, queryResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询提醒信息失败'
                })
            }

            res.send({
                status: 0,
                message: '创建提醒成功',
                data: {
                    reminder: queryResults[0]
                }
            })
        })
    })
}

exports.getReminderList = (req, res) => {
    const { user_id, is_sent } = req.query

    if (!user_id) {
        return res.send({
            status: 1,
            message: '用户ID不能为空'
        })
    }

    let sql = `
        SELECT 
            r.id,
            r.user_id,
            r.trip_id,
            r.reminder_type,
            r.reminder_time,
            r.content,
            r.is_sent,
            r.created_at,
            t.trip_name,
            t.destination,
            t.start_date,
            t.end_date
        FROM reminders r
        LEFT JOIN trips t ON r.trip_id = t.id
        WHERE r.user_id = ?
    `

    const params = [user_id]

    if (is_sent !== undefined) {
        sql += ' AND r.is_sent = ?'
        params.push(is_sent)
    }

    sql += ' ORDER BY r.reminder_time ASC'

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询提醒列表失败：' + err.message
            })
        }

        const reminderTypeMap = {
            'departure': '出发提醒',
            'weather': '天气提醒',
            'schedule': '行程提醒',
            'custom': '自定义提醒'
        }

        const reminders = results.map(reminder => ({
            ...reminder,
            reminder_type_name: reminderTypeMap[reminder.reminder_type] || reminder.reminder_type
        }))

        res.send({
            status: 0,
            message: '获取提醒列表成功',
            data: {
                total: reminders.length,
                reminders: reminders
            }
        })
    })
}

exports.updateReminder = (req, res) => {
    const { id } = req.params
    const { reminder_type, reminder_time, content, is_sent } = req.body

    if (!id) {
        return res.send({
            status: 1,
            message: '提醒ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM reminders WHERE id = ?'
    db.query(checkSql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询提醒失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '提醒不存在'
            })
        }

        const updateFields = []
        const updateValues = []

        if (reminder_type) {
            const validTypes = ['departure', 'weather', 'schedule', 'custom']
            if (!validTypes.includes(reminder_type)) {
                return res.send({
                    status: 1,
                    message: '提醒类型不合法，必须是：departure/weather/schedule/custom'
                })
            }
            updateFields.push('reminder_type = ?')
            updateValues.push(reminder_type)
        }

        if (reminder_time) {
            updateFields.push('reminder_time = ?')
            updateValues.push(reminder_time)
        }

        if (content !== undefined) {
            updateFields.push('content = ?')
            updateValues.push(content)
        }

        if (is_sent !== undefined) {
            updateFields.push('is_sent = ?')
            updateValues.push(is_sent)
        }

        if (updateFields.length === 0) {
            return res.send({
                status: 1,
                message: '没有需要更新的字段'
            })
        }

        updateValues.push(id)

        const updateSql = `UPDATE reminders SET ${updateFields.join(', ')} WHERE id = ?`

        db.query(updateSql, updateValues, (err, updateResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '更新提醒失败：' + err.message
                })
            }

            if (updateResults.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '更新提醒失败'
                })
            }

            const querySql = `
                SELECT 
                    r.*,
                    t.trip_name,
                    t.destination
                FROM reminders r
                LEFT JOIN trips t ON r.trip_id = t.id
                WHERE r.id = ?
            `

            db.query(querySql, id, (err, queryResults) => {
                if (err) {
                    return res.send({
                        status: 1,
                        message: '查询更新后的提醒信息失败'
                    })
                }

                res.send({
                    status: 0,
                    message: '更新提醒成功',
                    data: {
                        reminder: queryResults[0]
                    }
                })
            })
        })
    })
}

exports.deleteReminder = (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.send({
            status: 1,
            message: '提醒ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM reminders WHERE id = ?'
    db.query(checkSql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询提醒失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '提醒不存在'
            })
        }

        const deleteSql = 'DELETE FROM reminders WHERE id = ?'
        db.query(deleteSql, id, (err, deleteResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '删除提醒失败：' + err.message
                })
            }

            if (deleteResults.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '删除提醒失败'
                })
            }

            res.send({
                status: 0,
                message: '删除提醒成功',
                data: {
                    deleted_reminder_id: parseInt(id)
                }
            })
        })
    })
}
