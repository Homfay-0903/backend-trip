const db = require('../db/index.js')

exports.addFavorite = (req, res) => {
    const favoriteInfo = req.body

    if (!favoriteInfo.user_id || !favoriteInfo.poi_name) {
        return res.send({
            status: 1,
            message: '用户ID和景点名称不能为空'
        })
    }

    if (favoriteInfo.poi_id) {
        const checkSql = 'SELECT * FROM favorites WHERE user_id = ? AND poi_id = ?'
        db.query(checkSql, [favoriteInfo.user_id, favoriteInfo.poi_id], (err, results) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询收藏记录失败：' + err.message
                })
            }

            if (results.length > 0) {
                return res.send({
                    status: 1,
                    message: '您已经收藏过这个景点了'
                })
            }

            insertFavorite(favoriteInfo, res)
        })
    } else {
        insertFavorite(favoriteInfo, res)
    }
}

function insertFavorite(favoriteInfo, res) {
    const sql = 'INSERT INTO favorites SET ?'
    const favoriteData = {
        user_id: favoriteInfo.user_id,
        poi_id: favoriteInfo.poi_id || null,
        poi_name: favoriteInfo.poi_name,
        poi_address: favoriteInfo.poi_address || null,
        city: favoriteInfo.city || null,
        poi_type: favoriteInfo.poi_type || null
    }

    db.query(sql, favoriteData, (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.send({
                    status: 1,
                    message: '您已经收藏过这个景点了'
                })
            }
            return res.send({
                status: 1,
                message: '收藏景点失败：' + err.message
            })
        }

        if (results.affectedRows !== 1) {
            return res.send({
                status: 1,
                message: '收藏景点失败'
            })
        }

        const querySql = 'SELECT * FROM favorites WHERE id = ?'
        db.query(querySql, results.insertId, (err, queryResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '查询收藏信息失败'
                })
            }

            res.send({
                status: 0,
                message: '收藏景点成功',
                data: {
                    favorite: queryResults[0]
                }
            })
        })
    })
}

exports.getFavoriteList = (req, res) => {
    const { user_id, city } = req.query

    if (!user_id) {
        return res.send({
            status: 1,
            message: '用户ID不能为空'
        })
    }

    let sql = 'SELECT * FROM favorites WHERE user_id = ?'
    const params = [user_id]

    if (city) {
        sql += ' AND city = ?'
        params.push(city)
    }

    sql += ' ORDER BY created_at DESC'

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询收藏列表失败：' + err.message
            })
        }

        res.send({
            status: 0,
            message: '获取收藏列表成功',
            data: {
                total: results.length,
                favorites: results
            }
        })
    })
}

exports.deleteFavorite = (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.send({
            status: 1,
            message: '收藏ID不能为空'
        })
    }

    const checkSql = 'SELECT * FROM favorites WHERE id = ?'
    db.query(checkSql, id, (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: '查询收藏记录失败：' + err.message
            })
        }

        if (results.length === 0) {
            return res.send({
                status: 1,
                message: '收藏记录不存在'
            })
        }

        const deleteSql = 'DELETE FROM favorites WHERE id = ?'
        db.query(deleteSql, id, (err, deleteResults) => {
            if (err) {
                return res.send({
                    status: 1,
                    message: '取消收藏失败：' + err.message
                })
            }

            if (deleteResults.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '取消收藏失败'
                })
            }

            res.send({
                status: 0,
                message: '取消收藏成功',
                data: {
                    deleted_favorite_id: parseInt(id)
                }
            })
        })
    })
}
