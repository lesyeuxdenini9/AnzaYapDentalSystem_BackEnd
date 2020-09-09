const express = require('express')
const app = express()

const { Action , ActionTeeth , Teeth } = require('../models/index')


const passport = require('../helper/passport')
app.use(passport.initialize())
const {checkisAuthenticated,checknotAuthenticated,PassportAuthenticate} = require('../helper/authenticator')

app.get('/test',(req,res,next)=>{
    res.json("test")
})

app.get('/action', async (req,res,next)=>{
    const actiondata = await Action.findOne({
        where: {
            id: 1
        }
    })

    let teethdata = await actiondata.getTeeths()

    res.json({action: actiondata, teeth: teethdata})
})

app.get('/removeaction',async (req,res,next)=>{
    const actiondata = await Action.findOne({
        where: {
            id: 1
        }
    })

    const teeth = await Teeth.findOne({
        where: {
            id: 115
        }
    })

    //const removedata = await actiondata.removeTeeths([102,99])
    const removedata = await actiondata.removeTeeths(teeth)

    res.json(removedata)
})



module.exports = app