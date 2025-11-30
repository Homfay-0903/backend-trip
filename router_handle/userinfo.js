const db = require('../db/index')

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