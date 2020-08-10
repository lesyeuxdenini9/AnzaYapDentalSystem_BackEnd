const express = require('express')
const app = express()

const authcontroller = require('../controllers/authcontroller')
const passport = require('../helper/passport')
app.use(passport.initialize())
const {checkisAuthenticated,checknotAuthenticated,PassportAuthenticate} = require('../helper/authenticator')

app.post('/login',authcontroller.login)
app.post('/refreshtoken',authcontroller.refreshtoken)
app.delete('/logout',PassportAuthenticate(passport),checkisAuthenticated,authcontroller.logout)
app.get('/test',PassportAuthenticate(passport),checkisAuthenticated,(req,res,next)=>{
   req.user.then((user)=>res.json(user))
})

app.post('/sendResetLink',authcontroller.sendResetLink)
app.post('/changepass',authcontroller.changepass)
app.post('/pushnotiftoken',PassportAuthenticate(passport),checkisAuthenticated,authcontroller.pushnotiftoken)

module.exports = app
