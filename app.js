const express = require('express')
const app = express()
const port = 3000

const cors = require('cors')
app.use(cors())

const bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())
// parse application/json
app.use(bodyParser.json())


const LoginRouter = require('./router/login')
app.use('/api', LoginRouter)

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
