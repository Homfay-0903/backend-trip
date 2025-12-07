const db = require('../db/index')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const fs = require('fs')

exports.getUserInfo = (req, res) => {
    const { id } = req.body
    const sql = 'select * from users where id = ?'
    db.query(sql, id, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        results[0].password = ''
        res.send({
            status: 0,
            results: results[0]
        })
    })
}

exports.changeName = (req, res) => {
    const { id, name } = req.body
    const sql = 'update users set name = ? where id = ?'
    db.query(sql, [name, id], (err, results) => {
        if (err) return res.cc(err);

        res.send({
            status: 0,
            message: '修改昵称成功'
        })
    })
}

exports.changeSex = (req, res) => {
    const { id, sex } = req.body
    const sql = 'update users set sex = ? where id = ?'
    db.query(sql, [sex, id], (err, results) => {
        if (err) return res.cc(err);

        res.send({
            status: 0,
            message: '修改性别成功'
        })
    })
}

exports.changeEmail = (req, res) => {
    const { id, email } = req.body
    const sql = 'update users set email = ? where id = ?'
    db.query(sql, [email, id], (err, results) => {
        if (err) return res.cc(err);

        res.send({
            status: 0,
            message: '修改邮箱成功'
        })
    })
}

exports.changePassword = (req, res) => {
    const { id, password } = req.body
    const newPassword = bcrypt.hashSync(password, 10)
    const sql = 'update users set password = ? where id = ?'
    db.query(sql, [newPassword, id], (err, results) => {
        if (err) {
            return res.cc(err)
        }

        res.send({
            status: 0,
            message: '修改密码成功'
        })
    })
}

exports.uploadAvatar = (req, res) => {
    const onlyId = crypto.randomUUID()

    let oldName = req.files[0].filename;
    let newName = Buffer.from(req.files[0].originalname, 'latin1').toString('utf8')
    fs.renameSync('./public/upload/' + oldName, './public/upload/' + newName)

    const sql = 'insert into image set ?'
    db.query(sql, {
        image_url: `http://127.0.0.1:3000/upload/${newName}`,
        onlyId
    }, (err, results) => {
        if (err) return res.cc(err)
        res.send({
            onlyId,
            status: 0,
            url: 'http://127.0.0.1:3000/upload/' + newName
        })
    })
}

exports.bindAccount = (req, res) => {
    const { account, onlyId, url } = req.body
    const sql = 'update image set account = ? where onlyId = ?'
    db.query(sql, [account, onlyId], (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.affectedRows == 1) {
            const sql1 = 'update users set image_url = ? where account = ?'
            db.query(sql1, [url, account], (err, results) => {
                if (err) {
                    return res.cc(err)
                }
                res.send({
                    status: 0,
                    message: '修改成功'
                })
            })
        }
    })
}