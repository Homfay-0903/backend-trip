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