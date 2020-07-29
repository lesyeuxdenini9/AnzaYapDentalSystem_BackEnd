const { Branch } = require('../models/index')

class Branch_ {

    publicList(){
        return new Promise((resolve,reject)=>{
            Branch.scope("active","schedules","services","dentist").findAll()
            .then(data=>resolve(data))
            .catch(err=>reject(err))
        })
    }
 
    list(branchid){
        return new Promise((resolve,reject)=>{
            if(branchid == null){
               Branch.scope("active","schedules").findAll()
               .then(data=>resolve(data))
            }else{
               Branch.scope("active","schedules").findAll({
                    where: {
                        id: branchid
                    }
                }).then(data=>resolve(data))
            }
            
          
        })
    }

     
    getListAllInfo(branchid){
        return new Promise((resolve,reject)=>{
            if(branchid == null){
               Branch.scope("active","schedules","services","dentist").findAll()
               .then(data=>resolve(data))
            }else{
               Branch.scope("active","schedules","services","dentist").findAll({
                    where: {
                        id: branchid
                    }
                }).then(data=>resolve(data))
            }
            
          
        })
    }

    getInfo(idno){
        return new Promise((resolve,reject)=>{
               Branch.scope("active","schedules","services","dentist",{method: ["medicines", 0]}).findAll({
                    where: {
                        id: idno
                    }
                }).then(data=>resolve(data))
               
        })
    }

    getListUser(branchid,type){
        return new Promise((resolve,reject)=>{
            if(branchid == null){
               Branch.scope("active","schedules",{method: ['users', type]}).findAll()
               .then(data=>resolve(data))
            }else{
               Branch.scope("active", "schedules",{method: ['users', type]}).findAll({
                    where: {
                        id: branchid
                    }
                }).then(data=>resolve(data))
            }
            
          
        })
    }

    getListMedicine(branchid,type){
        return new Promise((resolve,reject)=>{
            if(branchid == null){
               Branch.scope("active","schedules",{method: ['medicines', type]}).findAll()
               .then(data=>resolve(data))
            }else{
               Branch.scope("active", "schedules",{method: ['medicines', type]}).findAll({
                    where: {
                        id: branchid
                    }
                }).then(data=>resolve(data))
            }
            
          
        })
    }

    getListService(branchid){
        return new Promise((resolve,reject)=>{
        if(branchid == null){
            Branch.scope("active","schedules","services").findAll()
            .then(data=>resolve(data))
         }else{
            Branch.scope("active", "schedules","services").findAll({
                 where: {
                     id: branchid
                 }
             }).then(data=>resolve(data))
         }
        })
    }

    getListDentist(branchid){
        return new Promise((resolve,reject)=>{
        if(branchid == null){
            Branch.scope("active","schedules","dentist").findAll()
            .then(data=>resolve(data))
         }else{
            Branch.scope("active", "schedules","dentist").findAll({
                 where: {
                     id: branchid
                 }
             }).then(data=>resolve(data))
         }
        })
    }
  
}

module.exports = new Branch_()