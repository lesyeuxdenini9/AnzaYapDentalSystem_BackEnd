const { Reservation, User , Dentist , Transaction , Treatment , Branch , Schedule , Service} = require('../models/index')
const { response } = require('express')
const Sequelize = require('sequelize')
const { where } = require('sequelize')
const schedule = require('./schedule')
const op = Sequelize.Op
const col = Sequelize.col
const fn = Sequelize.fn
const literal = Sequelize.literal

class Reservation_ {

    getReservationPaginate(status, branch , page , limit ){
        return new Promise(async (resolve,reject)=>{
            let whereclause = { status: parseInt(status) }
            if(branch != null) whereclause.branchId = branch
            let data = await Reservation.findAll({
                include: [
                    {
                        model: User.scope(["active"]),
                        attributes: { exclude: ['createdAt','updatedAt','password'] },
                        required: true, 
                    },
                    {
                        model: Dentist.scope(["active"]),
                        required: true, 
                    },
                    {
                        model: Transaction.scope(["active"]),
                        required: false,
                    },
                    {
                        model: Branch,
                        required: true,
                    }
                ],
                where: whereclause,
                offset: (page-1) * limit,
                limit: limit,  
            })
            resolve(data)
        })
    }

    getByStatus(status, branch ){
        return new Promise(async (resolve,reject)=>{
            let whereclause = { status: parseInt(status) }
            if(branch != null) whereclause.branchId = branch
            let data = await Reservation.findAll({
                include: [
                    {
                        model: User.scope(["active"]),
                        attributes: { exclude: ['createdAt','updatedAt','password'] },
                        required: true, 
                    },
                    {
                        model: Dentist.scope(["active"]),
                        required: true, 
                    },
                    {
                        model: Transaction.scope(["active"]),
                        required: false,
                    },
                    {
                        model: Branch,
                        required: true,
                    }
                ],
                where: whereclause
            })
            resolve(data)
        })
    }

    reservationInfo(idno){
        return new Promise(async (resolve,reject)=>{
            let data = await Reservation.findOne({
                include: [
                    {
                        model: User.scope(["active"]),
                        attributes: { exclude: ['createdAt','updatedAt','password'] },
                        required: true, 
                    },
                    {
                        model: Dentist.scope(["active"]),
                        required: true, 
                    },
                    {
                        model: Transaction.scope(["active"]),
                        required: false,
                    },{
                        model: Treatment.scope("active"),
                        required: false,
                        include: [
                            {
                                model: Service,
                                required: false,
                            }
                        ]
                    },{
                        model: Branch,
                        required: true,
                        include: [
                            {
                                model: Schedule,
                                required: true
                            }
                        ]
                    }
                ],
                where: {
                    id: parseInt(idno)
                }
            })
            resolve(data)
        })
    }


    getActiveListDay(date,dentist,branch){
        return new Promise(async (resolve,reject)=>{
            let data = await Reservation.findAll({
                where: {
                    status: {
                        [op.or]: [1,4]
                    },
                    dentistId: dentist,
                    date: String(date),
                    branchId: branch,
                }
            })

            resolve(data)
        })
    }

    getPatientReservations(start,end,userid,branchid, reservation){

        let whereclause = {}

        if(reservation == ""){
            whereclause = {
                userId: userid,
                branchId: branchid,
                [op.and]: [{
                    date: {
                        [op.gte]: String(start)
                    },
                },{
                    date: {
                        [op.lte]: String(end)
                    }
                }]
            }
        }else{
            whereclause = {
                userId: userid,
                branchId: branchid,
                reservationNo: {
                    [op.like]: `%${reservation}`
                }
            }
        }
        
        return new Promise(async (resolve,reject)=>{
            let data = await Reservation.findAll({
                include: [
                    {
                        model: Dentist.scope(["active"]),
                        attributes: ["fullname"],
                        required: true, 
                    },
                    {
                        model: Treatment.scope("active"),
                        required: false,
                    },
                    {
                        model: Branch,
                        required: false,
                    }
                ],
                where: whereclause,
                order: [
                    ['date','DESC']
                ]
            })
            resolve(data)
        })
    }

    getApprovedTimeDay(dentist,date){
        return new Promise(async (resolve,reject)=>{
            let data = await Reservation.findAll({
                where: {
                    // date: date,
                    dentistId: dentist,
                    status: 1,
                    date: String(date),
                }
            })

            resolve(data)
        })
    }

    appointments(start,end,branch,dentist){
        let dentistwhereclause = dentist == 0 ? { [op.gt]: 0 } : parseInt(dentist)
        return new Promise(async (resolve,reject)=>{
            let data = await Reservation.findAll({
                include: [
                    {
                        model: Dentist.scope(["active"]),
                        attributes: ["fullname"],
                        required: true, 
                    },
                    {
                        model: Treatment.scope("active"),
                        required: false,
                        include: [
                            {
                                model: Service,
                                required: true,
                            }
                        ]
                    },
                    {
                        model: User,
                        attributes: {exclude: ["createdAt","updatedAt","password"]},
                        required: true,
                    },{
                        model: Transaction,
                        attributes: ["transactionNo"],
                        required: false,
                    },{
                        model: Branch,
                        required: true,
                    }
                ],
                where: {
                    dentistId: dentistwhereclause,
                    branchId: branch,
                    [op.or]: [{status:1},{status:4},{status: 3}],
                    // status: 1,
                    [op.and]: [{
                        date: {
                            [op.gte]: String(start)
                        },
                    },{
                        date: {
                            [op.lte]: String(end)
                        }
                    }]
                }
            })
            resolve(data)
        })
    }

    getReservationFollowup(idno){
        return new Promise(async (resolve,reject)=>{
            let data = await Reservation.findAll({
              where: {
                status: 1,
                type: 1,
                transactionId: parseInt(idno),
              }
            })

            resolve(data)

        })
    }

    list(start,end,reservationNo,branch, dentist, status){

        let whereclause = {}

        if(reservationNo != ""){
            whereclause.reservationNo = {
                [op.like] : `%${reservationNo}`
            }
        }else{
            whereclause = {
                [op.and]: [
                    {
                        date: {
                            [op.gte]: String(start)
                        },
                    },{
                        date: {
                            [op.lte]: String(end)
                        }
                    }
                ]
            }

            if(dentist != "All") whereclause.dentistId = dentist
            if(status != "All") whereclause.status = parseInt(status)
            
        }

        if(status == "All"){
            whereclause.status = {
                [op.ne]: 0
            }
    
        }
  
        whereclause.branchId = branch


        return new Promise(async (resolve,reject)=>{
            let data  = await Reservation.findAll({
                include: [
                    {
                        model: User.scope(["active"]),
                        attributes: { exclude: ['createdAt','updatedAt','password'] },
                        required: true, 
                    },
                    {
                        model: Dentist.scope(["active"]),
                        required: true, 
                    },
                    {
                        model: Transaction.scope(["active"]),
                        required: false,
                    },{
                        model: Treatment.scope("active"),
                        require: false,
                    }
                ],
                where: whereclause})
            resolve(data)
        })

    
    }

}

module.exports = new Reservation_()