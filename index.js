require('dotenv').config()
const  express = require('express')
const  app = express()
// // using cors to setup the origin of client website that can only permitted
const cors = require('cors')
const corsOptions = {
      // origin: '*',
      origin: ['http://localhost:8082','http://localhost:8081','https://anza-yap-dental-clinic.herokuapp.com','https://anza-yap-dental-clinic.herokuapp.com:8888','http://localhost','capacitor://localhost'],
      methods: ['GET','POST','OPTIONS','PUT','PATCH','DELETE'],
      allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Authorization'],
      optionsSuccessStatus: 200,
      credentials: true,
}

app.use(cors(corsOptions))

app.set('view engine', 'ejs')

const bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// test global var
const { maskzero } = require('./app/helper/helper')
app.locals.maskzero = maskzero
app.locals.testvar = "hello world"

var methodOverride = require('method-override')
 

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

app.use('/public', express.static('public'))

const index = require('./app/routes/index')
const auth = require('./app/routes/auth')
const api = require('./app/routes/api')

app.use('/',index)
app.use('/api',api)
app.use('/api/auth',auth)

const server = require('./app/config/server')

// app.listen(server.server.port, function(){
//   console.log(`Server running at port ${server.server.port}: http://127.0.0.1:${server.server.port}`)
// })

// SOCKET FOR REALTIME LISTENING EVENT
let http = require('http').Server(app)
let io = require('socket.io')(http)
// io.origins(['http://localhost:8081','https://anza-yap-dental-clinic.herokuapp.com'])
// io.origins('*:*')
// io.set('origins', '*:*');
// io.set('origins', 'https://anza-yap-dental-clinic.herokuapp.com');

io.origins((origin, callback) => {
  if (origin == 'https://anza-yap-dental-clinic.herokuapp.com' || origin == 'http://localhost:8081' || origin == 'http://localhost:8082' || origin == 'http://localhost' || origin == 'capacitor://localhost') {
      return callback(null, true);
  }
  return callback('origin not allowed', false);
});

  

http.listen(server.server.port, ()=>{
  console.log(`Server running at port ${server.server.port}: http://127.0.0.1:${server.server.port}`)
});

io.on('connection', (socket)=>{
  
  socket.on('disconnect',()=>{
    io.emit('countconnected',Object.keys(io.sockets.connected).length)
  })
  socket.on('error', (error) => {
    // ...
  })

  socket.on('reservationCreated',(data)=>{
    socket.broadcast.emit('updateReservation',(data))
  })

  socket.on('updatedentistTransaction',()=>{
      socket.broadcast.emit('dentistTransaction')
  })


  socket.on('notificationCreated',()=>{
    socket.broadcast.emit('updateNotification')
  })

  socket.on('listenPrivate', function(room){
    socket.join(room)
  })

  
  socket.on('updatePatientNotification',(data)=>{
    socket.broadcast.to(data.privateID).emit('updatePatientNotification',(data));
  })

})
