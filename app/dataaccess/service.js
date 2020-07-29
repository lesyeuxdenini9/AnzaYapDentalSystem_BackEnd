const { Service } = require('../models/index')

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
  
}

module.exports = new Service_()