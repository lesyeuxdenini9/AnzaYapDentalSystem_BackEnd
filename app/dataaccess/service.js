const { Service } = require('../models/index')
const Sequelize = require('sequelize')
const op = Sequelize.Op
class Service_ {
 
    List(branch){
        return new Promise((resolve,reject)=>{
            let services = Service.scope("active").findAll({
                where: {
                    branchId: branch
                }
            })
            resolve(services)
        })
    }

    getService(idno){
        return new Promise((resolve,reject)=>{
            let data = Service.scope(["active"]).findOne({where: {id: idno}})
            resolve(data)
        })
    }

    search(search,branch){
        return new Promise((resolve,reject)=>{
            // let data = Service.scope(["active"]).findAll({where: {service: {[op.like]: `%${search}%`},branchId: branch}})
            let data = Service.findAll({where: {service: {[op.like]: `%${search}%`},branchId: branch}})
            resolve(data)
        })
    }
  
}

module.exports = new Service_()