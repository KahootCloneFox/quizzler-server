const express = require('express')
var cors = require('cors')
const PORT = process.env.PORT || 3000
const app = express()
app.use(cors())
const server = require('http').createServer(app)
const io = require('socket.io')(server)

server.listen(PORT)
