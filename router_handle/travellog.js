const db = require('../db/index.js')

exports.createTravelLog = (req, res) => {
    const travelLogInfo = req.body

    if (!travelLogInfo.user_id || !travelLogInfo.title || !travelLogInfo.content) {
        return res.send({
            status: 1,
            message: '用户ID、标题和内容不能为空'
        })
    }

    if (travelLogInfo.trip_id) {
        const checkTripSql = 'SELECT * FROM trips WHERE id = ?'
        db.query(checkTripSql, travelLogInfo.trip_id, (err, tripResults) => {
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

            insertTravelLog(travelLogInfo, res)
        })
    } else {
        insertTravelLog(travelLogInfo, res)
    }
}

function insertTravelLog(travelLogInfo, res) {
    const sql = 'INSERT INTO travel_logs SET ?'
    const travelLogData = {
        user_id: travelLogInfo.user_id,
        trip_id: travelLogInfo.trip_id || null,
        title: travelLogInfo.title,
        content: travelLogInfo.content,
        cover_image: travelLogInfo.cover_image || null,
        images: travelLogInfo.images ? JSON.stringify(travelLogInfo.images) : null,
        tags: travelLogInfo.tags || null,
        is_public: travelLogInfo.is_public !== undefined ? travelLogInfo.is_public : 1
    }

    db.query(sql, travelLogData, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '发布游记失败：' + err.message
            })
        }

        if (results.affectedRows !== 1) {
            return res.send({
                status: 1,
                message: '发布游记失败'
            })
        }

        const travelLogId = results.insertId
        const querySql = 'SELECT * FROM travel_logs WHERE id = ?'
        db.query(querySql, travelLogId, (err, travelLogResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询游记信息失败'
                })
            }

            res.send({
                status: 0,
                message: '发布游记成功',
                data: {
                    travel_log_id: travelLogId,
                    travel_log: travelLogResults[0]
                }
            })
        })
    })
}

exports.getTravelLogList = (req, res) => {
    const { page = 1, page_size = 10, user_id, sort = 'latest' } = req.query
    const offset = (page - 1) * page_size

    let sql = `
        SELECT 
            tl.id,
            tl.user_id,
            tl.trip_id,
            tl.title,
            tl.content,
            tl.cover_image,
            tl.images,
            tl.tags,
            tl.views,
            tl.likes,
            tl.is_public,
            tl.created_at,
            tl.updated_at,
            u.name as author_name,
            u.image_url as author_avatar,
            t.trip_name,
            t.destination
        FROM travel_logs tl
        LEFT JOIN users u ON tl.user_id = u.id
        LEFT JOIN trips t ON tl.trip_id = t.id
        WHERE tl.is_public = 1
    `

    const params = []

    if (user_id) {
        sql += ' AND tl.user_id = ?'
        params.push(user_id)
    }

    if (sort === 'popular') {
        sql += ' ORDER BY tl.likes DESC, tl.views DESC, tl.created_at DESC'
    } else {
        sql += ' ORDER BY tl.created_at DESC'
    }

    sql += ' LIMIT ? OFFSET ?'
    params.push(parseInt(page_size), parseInt(offset))

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询游记列表失败：' + err.message
            })
        }

        const countSql = `
            SELECT COUNT(*) as total
            FROM travel_logs
            WHERE is_public = 1
            ${user_id ? ' AND user_id = ?' : ''}
        `

        const countParams = user_id ? [user_id] : []

        db.query(countSql, countParams, (err, countResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询游记总数失败：' + err.message
                })
            }

            const total = countResults[0].total
            const totalPages = Math.ceil(total / page_size)

            const travelLogs = results.map(log => ({
                ...log,
                images: log.images ? JSON.parse(log.images) : [],
                tags: log.tags ? JSON.parse(log.tags) : [],
                likes_count: log.likes,
                content_preview: log.content.substring(0, 100) + (log.content.length > 100 ? '...' : '')
            }))

            res.send({
                status: 0,
                message: '获取游记列表成功',
                data: {
                    page: parseInt(page),
                    page_size: parseInt(page_size),
                    total: total,
                    total_pages: totalPages,
                    list: travelLogs
                }
            })
        })
    })
}

exports.getTravelLogDetail = (req, res) => {
    const { id } = req.params
    const { user_id } = req.query

    if (!id) {
        return res.send({
            status: 1,
            message: '游记ID不能为空'
        })
    }

    const updateViewSql = 'UPDATE travel_logs SET views = views + 1 WHERE id = ?'
    db.query(updateViewSql, id, (err) => {
        if (err) {
            console.error('更新浏览量失败：', err.message)
        }
    })

    const sql = `
        SELECT 
            tl.id,
            tl.user_id,
            tl.trip_id,
            tl.title,
            tl.content,
            tl.cover_image,
            tl.images,
            tl.tags,
            tl.views,
            tl.likes,
            tl.is_public,
            tl.created_at,
            tl.updated_at,
            u.name as author_name,
            u.image_url as author_avatar,
            t.trip_name,
            t.destination,
            t.start_date,
            t.end_date
        FROM travel_logs tl
        LEFT JOIN users u ON tl.user_id = u.id
        LEFT JOIN trips t ON tl.trip_id = t.id
        WHERE tl.id = ?
    `

    db.query(sql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询游记详情失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '游记不存在'
            })
        }

        const travelLog = {
            ...results[0],
            images: results[0].images ? JSON.parse(results[0].images) : [],
            tags: results[0].tags ? JSON.parse(results[0].tags) : [],
            likes_count: results[0].likes
        }

        const checkLikeSql = 'SELECT * FROM likes WHERE travel_log_id = ? AND user_id = ?'
        db.query(checkLikeSql, [id, user_id], (err, likeResults) => {
            if (err) {
                console.error('查询点赞记录失败：', err.message)
            }
            travelLog.is_liked = likeResults && likeResults.length > 0

            const commentSql = `
                SELECT 
                    c.id,
                    c.user_id,
                    c.content,
                    c.parent_id,
                    c.likes,
                    c.created_at,
                    u.name as user_name,
                    u.image_url as user_avatar
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.id
                WHERE c.travel_log_id = ?
                ORDER BY c.created_at DESC
            `

            db.query(commentSql, id, (err, commentResults) => {
                if (err) {
                    console.error('查询评论失败：', err.message)
                }

                travelLog.comments = commentResults || []
                travelLog.comment_count = commentResults ? commentResults.length : 0

                res.send({
                    status: 0,
                    message: '获取游记详情成功',
                    data: {
                        travel_log: travelLog
                    }
                })
            })
        })
    })
}

exports.likeTravelLog = (req, res) => {
    const { id } = req.params
    const { user_id } = req.body

    if (!id || !user_id) {
        return res.send({
            status: 1,
            message: '游记ID和用户ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM travel_logs WHERE id = ?'
    db.query(checkSql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询游记失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '游记不存在'
            })
        }

        const checkLikeSql = 'SELECT * FROM likes WHERE travel_log_id = ? AND user_id = ?'
        db.query(checkLikeSql, [id, user_id], (err, likeResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询点赞记录失败：' + err.message
                })
            }

            if (likeResults.length > 0) {
                const deleteLikeSql = 'DELETE FROM likes WHERE travel_log_id = ? AND user_id = ?'
                db.query(deleteLikeSql, [id, user_id], (err, deleteResults) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: '取消点赞失败：' + err.message
                        })
                    }

                    const updateLikesSql = 'UPDATE travel_logs SET likes = GREATEST(likes - 1, 0) WHERE id = ?'
                    db.query(updateLikesSql, id, (err) => {
                        if (err) {
                            console.error('更新点赞数失败：', err.message)
                        }
                    })

                    const querySql = 'SELECT likes FROM travel_logs WHERE id = ?'
                    db.query(querySql, id, (err, likeCountResults) => {
                        if (err) {
                            return res.send({
                                status: 1,
                                message: '查询点赞数失败'
                            })
                        }

                        res.send({
                            status: 0,
                            message: '取消点赞成功',
                            data: {
                                travel_log_id: parseInt(id),
                                likes_count: likeCountResults[0].likes,
                                is_liked: false
                            }
                        })
                    })
                })
            } else {
                const insertLikeSql = 'INSERT INTO likes SET ?'
                const likeData = {
                    travel_log_id: id,
                    user_id: user_id
                }

                db.query(insertLikeSql, likeData, (err, insertResults) => {
                    if (err) {
                        return res.send({
                            status: 1,
                            message: '点赞失败：' + err.message
                        })
                    }

                    const updateLikesSql = 'UPDATE travel_logs SET likes = likes + 1 WHERE id = ?'
                    db.query(updateLikesSql, id, (err) => {
                        if (err) {
                            console.error('更新点赞数失败：', err.message)
                        }
                    })

                    const querySql = 'SELECT likes FROM travel_logs WHERE id = ?'
                    db.query(querySql, id, (err, likeCountResults) => {
                        if (err) {
                            return res.send({
                                status: 1,
                                message: '查询点赞数失败'
                            })
                        }

                        res.send({
                            status: 0,
                            message: '点赞成功',
                            data: {
                                travel_log_id: parseInt(id),
                                likes_count: likeCountResults[0].likes,
                                is_liked: true
                            }
                        })
                    })
                })
            }
        })
    })
}

exports.deleteTravelLog = (req, res) => {
    const { id } = req.params
    const { user_id } = req.body

    if (!id || !user_id) {
        return res.send({
            status: 1,
            message: '游记ID和用户ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM travel_logs WHERE id = ?'
    db.query(checkSql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询游记失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '游记不存在'
            })
        }

        const travelLog = results[0]

        if (travelLog.user_id != user_id) {
            return res.send({
                status: 1,
                message: '无权删除此游记'
            })
        }

        const deleteLikesSql = 'DELETE FROM likes WHERE travel_log_id = ?'
        db.query(deleteLikesSql, id, (err) => {
            if (err) {
                console.error('删除点赞记录失败：', err.message)
            }
        })

        const deleteCommentsSql = 'DELETE FROM comments WHERE travel_log_id = ?'
        db.query(deleteCommentsSql, id, (err) => {
            if (err) {
                console.error('删除评论失败：', err.message)
            }
        })

        const deleteSql = 'DELETE FROM travel_logs WHERE id = ?'
        db.query(deleteSql, id, (err, deleteResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '删除游记失败：' + err.message
                })
            }

            if (deleteResults.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '删除游记失败'
                })
            }

            res.send({
                status: 0,
                message: '删除游记成功',
                data: {
                    deleted_travel_log_id: parseInt(id)
                }
            })
        })
    })
}
