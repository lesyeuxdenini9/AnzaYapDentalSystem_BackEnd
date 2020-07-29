const { Dentist } = require('../models/index')

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
  
}

module.exports = new Dentist_()