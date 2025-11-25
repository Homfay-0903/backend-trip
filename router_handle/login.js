const db = require('../db/index.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtconfig = require('../jwt_config/index.js')

exports.register = (req, res) => {
    const reg_info = req.body
    if (!reg_info.account || !reg_info.password) {
        return res.send({
            status: 1,
            message: '账号或者密码不能为空'
        })
    }

    const sql = 'select * from users where account = ?'
    db.query(sql, reg_info.account, (err, results) => {
        if (results.length > 0) {
            return res.send({
                status: 1,
                message: '账号已存在'
            })
        }

        reg_info.password = bcrypt.hashSync(reg_info.password, 10)

        const sql1 = 'insert into users set ?'
        db.query(sql1, {
            account: reg_info.account,
            password: reg_info.password
        }, (err, results) => {
            if (results.affectedRows !== 1) {
                return res.send({
                    status: 1,
                    message: '注册账号失败'
                })
            }
            res.send({
                status: 0,
                message: '注册账号成功'
            })
        })
    })
}