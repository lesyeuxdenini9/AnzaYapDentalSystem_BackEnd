const { Dentist } = require('../models/index')
const Sequelize = require('sequelize')
const op = Sequelize.Op
class Dentist_ {
 
    List(){
        return new Promise((resolve,reject)=>{
            let data = Dentist.scope("active").findAll()
            resolve(data)
        })
    }

    getDentist(idno){
        return new Promise((resolve,reject)=>{
            let data = Dentist.scope(["active"]).findOne({where: {id: idno}})
            resolve(data)
        })
    }

    search(search,branch){
        return new Promise((resolve,reject)=>{
            let data = Dentist.findAll({where: {branchId: branch, fullname : {[op.like]: `%${search}%`}}})
            resolve(data)
        })
    }
  
}

module.exports = new Dentist_()