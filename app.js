const express = require('express')
var cors = require('cors')
const fetchApi = require('./helpers/quiz-api')
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
function findRoomIndex(roomId) {
  return rooms.findIndex(e => e.id === roomId)
}
function findParticipantIndex(room, userId) {
  return room.participants.findIndex(e => e.userId === userId)
}

gameStart = async roomIndex => {
  const roomId = rooms[roomIndex].id
  rooms[roomIndex].questions = await fetchApi()
  for (let i = 0; i < rooms[roomIndex].questions.length; i++) {
    io.in(`room${roomId}`).emit('sendQuestion', rooms[roomIndex].questions[i])
    for (let j = 10; j >= 1; j--) {
      io.in(`room${roomId}`).emit('sendTimer', j)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    io.in(`room${roomId}`).emit('resetAnswered')
  }
  io.in(`room${roomId}`).emit('gameEnd', rooms)
}

io.on('connection', socket => {
  console.log('user connected')
  socket.on('enterHome', name => {
    socket.emit('sendUser', { name, userId: publicData.userId++ }) // lempar ke vuex store `SOCKET_onEnterHome`
    socket.emit('sendRooms', rooms)
  })

  socket.on('fetchRooms', () => {
    socket.emit('sendRooms', rooms)
  })

  socket.on('resetRoom', roomId => {
    socket.leave(`room${roomId}`)
    rooms[findRoomIndex(roomId)].participants = []
    rooms[findRoomIndex(roomId)].questions = []
    io.emit('sendRooms', rooms)
  })

  socket.on('createRoom', ({ name, max_participant, user }) => {
    const id = publicData.roomId++

    rooms.push({
      id,
      name,
      max_participant,
      participants: [],
      room_master: user,
    })
    io.emit('sendRooms', rooms)
  })

  socket.on('joinRoom', ({ user, roomId }) => {
    const room = rooms[findRoomIndex(roomId)]
    let flag = true
    rooms[findRoomIndex(roomId)].participants.forEach(e => {
      if (e.userId === user.userId) flag = false
    })

    if (!flag) {
      socket.join(`room${roomId}`)
      io.in(`room${roomId}`).emit('successJoinRoom', { roomId, rooms })
      return
    }
    if (room.participants.length >= room.max_participant) {
      socket.emit('failedJoinRoom', rooms)
      return
    }
    socket.join(`room${roomId}`)

    if (flag) rooms[findRoomIndex(roomId)].participants.push(user)

    io.in(`room${roomId}`).emit('successJoinRoom', { roomId, rooms })

    // avoid concurrency
    if (room.participants.length >= room.max_participant) {
      gameStart(findRoomIndex(roomId))
    }
  })
  socket.on('answerQuestion', ({ room, user, score }) => {
    const roomIndex = findRoomIndex(room.id)
    const userIndex = findParticipantIndex(rooms[roomIndex], user.userId)
    if (!rooms[roomIndex].participants[userIndex].score) {
      rooms[roomIndex].participants[userIndex].score = 0
    }
    rooms[roomIndex].participants[userIndex].score += score
    io.in(`room${room.id}`).emit('sendRooms', rooms)
    io.in(`room${room.id}`).emit('hasAnswered', user)
  })

  socket.on('leaveRoom', ({ user, roomId }) => {
    socket.leave(`room${roomId}`)
    rooms[findRoomIndex(roomId)].participants = rooms[
      findRoomIndex(roomId)
    ].participants.filter(e => user.userId !== e.userId)
    io.emit('sendRooms', rooms)
  })
})

server.listen(PORT)
