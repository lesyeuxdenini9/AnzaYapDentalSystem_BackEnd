const express = require('express')
const app = express()

const barangaycontroller = require('../controllers/barangaycontroller')
const passport = require('../helper/passport')
app.use(passport.initialize())
const {checkisAuthenticated,checknotAuthenticated,PassportAuthenticate} = require('../helper/authenticator')

app.post('/save',PassportAuthenticate(passport),checkisAuthenticated,barangaycontroller.saveBarangay)
app.get('/getlist',PassportAuthenticate(passport),checkisAuthenticated,barangaycontroller.getlist)
app.patch('/update/(:idno)',PassportAuthenticate(passport),checkisAuthenticated,barangaycontroller.update)
app.delete('/remove/(:idno)',PassportAuthenticate(passport),checkisAuthenticated,barangaycontroller.remove)
app.get('/details/(:idno)',PassportAuthenticate(passport),checkisAuthenticated,barangaycontroller.getDetails)

module.exports = app