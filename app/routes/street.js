const express = require('express')
const app = express()

const streetcontroller = require('../controllers/streetcontroller')
const passport = require('../helper/passport')
app.use(passport.initialize())
const {checkisAuthenticated,checknotAuthenticated,PassportAuthenticate} = require('../helper/authenticator')

app.post('/save',PassportAuthenticate(passport),checkisAuthenticated,streetcontroller.save)
app.get('/getList',PassportAuthenticate(passport),checkisAuthenticated,streetcontroller.getList)
app.get('/getList/(:idno)',PassportAuthenticate(passport),checkisAuthenticated,streetcontroller.getStreetByBarangay)
app.patch('/update/(:idno)',PassportAuthenticate(passport),checkisAuthenticated,streetcontroller.update)
app.delete('/remove/(:idno)',PassportAuthenticate(passport),checkisAuthenticated,streetcontroller.remove)
app.get('/details/(:idno)',PassportAuthenticate(passport),checkisAuthenticated,streetcontroller.getDetails)

module.exports = app