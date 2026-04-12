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

const multer = require("multer"); //1111
const upload = multer({
    dest: './public/upload'
})
app.use(upload.any())
app.use(express.static("./public"))

const bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())
// parse application/json
app.use(bodyParser.json())




const LoginRouter = require('./router/login')
app.use('/api', LoginRouter)

const UserInfoRouter = require('./router/userinfo')
app.use('/user', UserInfoRouter)

const TripRouter = require('./router/trip')
app.use('/trip', TripRouter)

const ScheduleRouter = require('./router/schedule')
app.use('/schedule', ScheduleRouter)

const ExpenseRouter = require('./router/expense')
app.use('/expense', ExpenseRouter)

const TravelLogRouter = require('./router/travellog')
app.use('/travellog', TravelLogRouter)

const ReminderRouter = require('./router/reminder')
app.use('/reminder', ReminderRouter)

const FavoriteRouter = require('./router/favorite')
app.use('/favorite', FavoriteRouter)

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
