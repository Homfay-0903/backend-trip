const express = require('express')
const app = express()
const port = 3000

app.use((req, res, next) => {
    res.cc = (err, status = 1) => {
        res.send({
            status,
            message: err instanceof Error ? err.message : err,
        })
    }
    next()
})

const cors = require('cors')
app.use(cors())

const bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())
// parse application/json
app.use(bodyParser.json())




const LoginRouter = require('./router/login')
app.use('/api', LoginRouter)

const UserInfoRouter = require('./router/userinfo')
app.use('/user', UserInfoRouter)

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
