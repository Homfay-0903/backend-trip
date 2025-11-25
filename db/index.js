const mysql = require('mysql')

const db = mysql.createPool({
    host: 'localhost',
    user: 'trip',
    password: '123456',
    database: 'trip'
})

module.exports = db