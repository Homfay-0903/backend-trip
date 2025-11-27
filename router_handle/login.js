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

        //更新users表
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

exports.login = (req, res) => {
    const login_info = req.body
    const sql = 'select * from users where account = ?'
    db.query(sql, login_info.account, (err, results) => {
        if (err) return res.cc(err);
        if (results.length !== 1) return res.cc('登录失败');

        const compareResult = bcrypt.compareSync(login_info.password, results[0].password)
        if (!compareResult) {
            return res.cc('登录失败')
        }

        const user = {
            ...results[0],
            password: '',
            imageUrl: ''
        }

        const tokenStr = jwt.sign(user, jwtconfig.jwtSecretKey, {
            expiresIn: '7h'
        })

        res.send({
            results: results[0],
            status: 0,
            message: '登录成功',
            token: 'Bearer ' + tokenStr,
        })
    })
}