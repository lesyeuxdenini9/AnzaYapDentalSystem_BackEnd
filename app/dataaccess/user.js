const { User , Branch } = require("../models/index")
const Sequelize = require('sequelize')
const op = Sequelize.Op
const col = Sequelize.col
const fn = Sequelize.fn
const literal = Sequelize.literal

class User_ {

    search(search,branch,type){
        return new Promise((resolve,reject)=>{
            // let data = User.scope(["active"]).findAll({where: {fullname: {[op.like]: `%${search}%`},branchId: branch,usertype: type}})
            let data = User.findAll({where: {fullname: {[op.like]: `%${search}%`},branchId: branch,usertype: type}})
            resolve(data)
        })
    }

    searchPatient({ lastname, middlename , firstname ,email , page , limit }){
      let whereclause = {}
      if(lastname!="") whereclause.lastname = { [op.like]: `%${lastname}%`}
      if(middlename!="") whereclause.middlename = { [op.like]: `%${middlename}%`}
      if(firstname!="") whereclause.firstname = { [op.like]: `%${firstname}%`}
      if(email!="") whereclause.email = { [op.like]: `%${email}%`}
      return new Promise((resolve,reject)=>{
            let data = User.scope(["active","patient"]).findAll(
                {
                    attributes: { exclude: ['createdAt','updatedAt','password'] },
                    where: whereclause,
                    offset: (page-1) * limit,
                    limit: limit, 
                    order: [ ['lastname', 'ASC'],['firstname', 'ASC']]                    
                }

                )
            resolve(data)
      })
    }

    userInfo(idno){
        return new Promise((resolve,reject)=>{
            let data = User.scope(["active"]).findOne({
                where: {id: idno},
                attributes: { exclude: ['createdAt','updatedAt','password'] },
            })
            resolve(data)
        })
    }

    getAll(type) {
        return new Promise((resolve,reject)=>{
            let data = User.scope(["active"]).findAll()
            resolve(data)
        })
    }

    getUserAll(type){
        return new Promise((resolve,reject)=>{
            let data = User.scope(["active"]).findAll({
                attributes: {
                    exclude: ["password"]
                },
                where: {usertype: type}})
            resolve(data)
        })
    }

    getUsersbyArchive(type,archive){
        return new Promise((resolve,reject)=>{
            let data = User.findAll({
                attributes: {
                    exclude: ["password"]
                },
                where: {usertype: type,archive: archive}})
            resolve(data)
        })
    }

    getUser(idno){
        return new Promise((resolve,reject)=>{
            let data = User.scope(["transaction","reservation"]).findOne({
                where: {id: idno},
                attributes: { exclude: ['createdAt','updatedAt','password'] },
            })
            resolve(data)
        })
    }

    getUserPass(idno){
        return new Promise((resolve,reject)=>{
            let data = User.scope(["active","transaction"]).findOne({
                where: {id: idno},
                attributes: ["password"]
            })
            resolve(data)
        })
    }

    searchUser(user){
        return new Promise((resolve,reject)=>{
            let data = User.scope(["active"]).findAll({
                where: {fullname: {[op.like]: `%${user}%`}},          
            })
            resolve(data)
        })
    }
}

module.exports = new User_()