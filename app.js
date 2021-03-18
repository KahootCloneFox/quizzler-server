const express = require('express')
var cors = require('cors')
const PORT = process.env.PORT || 3000
const app = express()
app.use(cors())
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const publicData = {
  userId: 1,
  roomId: 1,
}

const rooms = []

io.on('connection', socket => {
  console.log('user connected')
  socket.on('enterHome', name => {
    socket.emit('sendUser', { name, userId: publicData.userId++ }) // lempar ke vuex store `SOCKET_onEnterHome`
    socket.emit('sendRooms', rooms)
  })
  socket.on('createRoom', ({ name, max_participant, user }) => {
    const id = publicData.roomId++

    rooms.push({
      id,
      name,
      max_participant,
      participant: [],
      room_master: user,
    })
    io.emit('sendRooms', rooms)
  })
  socket.on('joinRoom', ({ name, roomId }) => {
    // socket.emit('successJoinRoom', rooms)
    // socket.emit('failedJoinRoom', rooms)
  })
  socket.on('changePlayerStatus', ({ roomId, userId, status }) => {
    // jika semua ready
    // dan participant lebih dari 1
    // playGame(socket, { roomId })
  })

  socket.on('playerAnswering', ({ roomId, userId, answer }) => {
    // new Date().valueOf()
  })
})

server.listen(PORT)
