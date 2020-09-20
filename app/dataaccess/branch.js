const { Branch , Medicine } = require('../models/index')
const Sequelize = require('sequelize')
const e = require('express')
const op = Sequelize.Op
class Branch_ {

    search(branch){
        return new Promise((resolve,reject)=>{
            Branch.scope("schedules").findAll({
                where: {
                    branch: {
                        [op.like]: `%${branch}%`
                    }
                }
            })
            .then(data=>resolve(data))
            .catch(err=>reject(err))
        })
    }

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

    listbyarchive(branchid,archive){
        return new Promise((resolve,reject)=>{
            if(branchid == null){
               Branch.scope("schedules").findAll({
                   where: {
                       archive: archive
                   }
               })
               .then(data=>resolve(data))
            }else{
               Branch.scope("schedules").findAll({
                    where: {
                        id: branchid,
                        archive: archive
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

    getInfo(idno,type){
        return new Promise((resolve,reject)=>{
               Branch.scope("active","schedules","services","dentist",{method: ["medicines", type]}).findAll({
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

    
    getListUserbyArchive(branchid,type, archive){
        let archivestatus = archive == "true" ? 0 : 1
        return new Promise((resolve,reject)=>{
            if(branchid == null){
               Branch.scope("active","schedules",{method: ['usersbyarchive', [type,archivestatus]]}).findAll()
               .then(data=>resolve(data))
            }else{
               Branch.scope("active", "schedules",{method: ['usersbyarchive', [type,archivestatus]]}).findAll({
                    where: {
                        id: branchid
                    }
                }).then(data=>resolve(data))
            }
            
          
        })
    }

    getListMedicineByArchive(branchid,type,archive){
            return new Promise((resolve,reject)=>{
                if(branchid == null){
                    if(type != 'All'){
                        Branch.scope("active","schedules",{method: ['medicinesbyarchive', {type:type, archive: archive}]}).findAll()
                        .then(data=>resolve(data))
                    }else{
                        Branch.scope("active","schedules").findAll({
                            include: [
                                {
                                    model: Medicine,
                                    where: {archive: archive},
                                    required: false,
                                }
                            ]
                        })
                        .then(data=>resolve(data))
                    }   
            
                }else{
                    if(type != 'All'){
                        Branch.scope("active", "schedules",{method: ['medicinesbyarchive', {type:type, archive: archive}]}).findAll({
                                where: {
                                    id: branchid
                                }
                            }).then(data=>resolve(data))
                    }else{
                        Branch.scope("active", "schedules").findAll({
                            include: [
                                {
                                    model: Medicine,
                                    where: {archive: archive},
                                    required: false,
                                }
                            ],
                            where: {
                                id: branchid
                            }
                        }).then(data=>resolve(data))
                    }
                }
            
        
        })
    }

    getListMedicine(branchid,type){
        return new Promise((resolve,reject)=>{
                if(branchid == null){
                    if(type != 'All'){
                        Branch.scope("active","schedules",{method: ['medicines', type]}).findAll()
                        .then(data=>resolve(data))
                    }else{
                        Branch.scope("active","schedules").findAll({
                            include: [
                                {
                                    model: Medicine.scope("active"),
                                    required: false,
                                }
                            ]
                        })
                        .then(data=>resolve(data))
                    }   
               
                }else{
                    if(type != 'All'){
                        Branch.scope("active", "schedules",{method: ['medicines', type]}).findAll({
                                where: {
                                    id: branchid
                                }
                            }).then(data=>resolve(data))
                    }else{
                        Branch.scope("active", "schedules").findAll({
                            include: [
                                {
                                    model: Medicine.scope("active"),
                                    required: false,
                                }
                            ],
                            where: {
                                id: branchid
                            }
                        }).then(data=>resolve(data))
                    }
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

    
    getListServiceByArchive(branchid,archive){
        return new Promise((resolve,reject)=>{
        if(branchid == null){
            Branch.scope("active","schedules",{method: ['servicesbyarchive',archive]}).findAll()
            .then(data=>resolve(data))
         }else{
            Branch.scope("active", "schedules",{method: ['servicesbyarchive',archive]}).findAll({
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

    
    getListDentistbyArchive(branchid,archive){
        return new Promise((resolve,reject)=>{
        if(branchid == null){
            Branch.scope("active","schedules",{method: ["dentistbyarchive",archive]}).findAll()
            .then(data=>resolve(data))
         }else{
            Branch.scope("active", "schedules",{method: ["dentistbyarchive",archive]}).findAll({
                 where: {
                     id: branchid
                 }
             }).then(data=>resolve(data))
         }
        })
    }
  
}

module.exports = new Branch_()
