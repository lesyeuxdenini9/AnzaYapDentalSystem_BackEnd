const express = require('express')
const app = express()


const passport = require('../helper/passport')
app.use(passport.initialize())
const {checkisAuthenticated,checknotAuthenticated,PassportAuthenticate} = require('../helper/authenticator')

app.get('/test',(req,res,next)=>{
    res.json("test")
})



module.exports = app