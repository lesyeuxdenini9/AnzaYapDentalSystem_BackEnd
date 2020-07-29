const { Refreshtoken } = require('../models/index')
const Sequelize = require('sequelize')
const op = Sequelize.Op
const col = Sequelize.col
const fn = Sequelize.fn

class Refreshtoken_ {
    constructor(){

    }

    getAllRefreshtoken(){
        return new Promise((resolve,reject)=>{
            // const data = Refreshtoken.findAll({where: {revoke: 0, createdAt: { [op.lte]: col('expiresAt')}}})
            const data = Refreshtoken.findAll({where: {revoke: 0}})
            resolve(data)
        })
    }

    getRefreshtoken(token){
        return new Promise((resolve,reject)=>{
            // const data = Refreshtoken.findOne({where: {token:token,revoke: 0,createdAt: {[op.lte]: col('expiresAt')}}})
            const data = Refreshtoken.findOne({where: {token:token,revoke: 0}})
            resolve(data)
        })
    }

    saveRefreshToken(refreshtoken,userID){
        const refresh = new Refreshtoken
        refresh.userId = userID
        refresh.token = refreshtoken
        refresh.save()
        const expireDate = new Date(refresh.createdAt)
        refresh.expiresAt = expireDate.setHours(expireDate.getHours()+48)
        return
    }

    revoke(token){
        Refreshtoken.findOne({where: {token: token}})
        .then((token)=>{
            token.revoke = 1
            token.save()
        })
        .catch((err)=>{
           
        })
    }

    async remove(token){
      await Refreshtoken.destroy({where: {token: token}})
    }
}

module.exports = new Refreshtoken_()