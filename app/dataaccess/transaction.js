const { Medicine , Stockout , Healthcard, Dentist, Transaction, User , Treatment, Action , Teeth, ActionTeeth , Prescription , Prescriptitem , Billing, sequelize , Branch , Schedule} = require('../models/index')
const Sequelize = require('sequelize')
const dentist = require('./dentist')
const { where } = require('sequelize')
const stockout = require('../models/stockout')
const op = Sequelize.Op
const col = Sequelize.col
const fn = Sequelize.fn
const literal = Sequelize.literal

class Transaction_ {
 
    List(){
        return new Promise((resolve,reject)=>{
            let transaction = Transaction.scope("active").findAll()
            resolve(services)
        })
    }

    getPrescriptInfoByRef(refno){
        return new Promise((resolve,reject)=>{
            let data = Prescription.scope(["active"]).findOne({
                include: [
                    {
                        model: Transaction.scope("active"),
                        include: [
                            {
                                model:  User.scope(["active","patient"]),
                                attributes: { exclude: ['createdAt','updatedAt','password'] },
                            }
                        ]
                    }
                ],  
                where: {
                    prescriptionNo: {
                        [op.like]: `%${refno}`
                    }
                }
            })

            resolve(data)
        })

    }

    getPrescriptInfo(idno){
        return new Promise((resolve,reject)=>{
            let data = Prescription.scope(["active"]).findOne({
                include: [
                    {
                        model: Transaction.scope(["active"]), 
                        include: [{
                            model: User.scope(["active","patient"]),
                            attributes: { exclude: ['createdAt','updatedAt','password'] },
                        },
                        {
                            model: Branch,
                            required: true,
                            include: [
                                {
                                    model: Schedule,
                                    required: true
                                }
                            ]
                        },{
                            model: Dentist,
                            required: true
                        }
                    
                     ]
        
                    },
                    {
                        model: Prescriptitem.scope(["active"]),
                    }
                ],  
                where: {
                    id: idno
                }
            })

            resolve(data)
        })
    }

    getTransactionByStatus({userid,status,branch}){
        return new Promise((resolve,reject)=>{


            let data = Transaction.scope(["active"]).findAll({
                    include: [
                        {
                            model: Treatment.scope(["active"]),
                            required: false,
                        }
                    ],
                    where: {
                        status: status,
                        userId: userid,
                        branchId: branch,
                    },
                    order: [
                        [{ model: Treatment }, 'id', 'ASC']
                    ]
            })

            resolve(data)

        })
    }

    getTransaction(idno){
        return new Promise((resolve,reject)=>{


            let data = Transaction.scope(["active"]).findOne({
                include: [{
                    model: User.scope(["active","patient"]),
                    attributes: { exclude: ['createdAt','updatedAt','password'] },
                    include: [
                        {
                            model: Teeth
                        }
                    ],  
                },
                {
                    model: Treatment.scope(["active"]),
                    required: false,
                    include: [
                        {
                            model: Action.scope(["active"]),
                            required:false,
                            include: [
                                {
                                    model: Teeth,
                                    as: "teeths",
                                    through :{
                                            model: ActionTeeth
                                    },             
                                },
                                {
                                    model: Stockout,
                                    required: false,
                                    include: [
                                        {
                                            model: Medicine,
                                            required: true,
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },{
                    model: Prescription.scope(["active"]),
                    required: false,
                    include: [{
                        model: Prescriptitem.scope(["active"]),
                    }]
                },{
                    model: Billing,
                    required: false,
                },{
                    model: Branch,
                    required: true,
                },{
                    model: Dentist,
                    required: true,
                }    
            ],
                where: {id: idno},  
                order: [
                    [ { model: Treatment },  { model: Action }, 'id', 'DESC'],
                    [ { model: User },  { model: Teeth }, 'id', 'ASC'],
                    [{model: Billing},'createdAt','ASC']
                ]   
            })

            resolve(data)
        })
    }

    viewBill(idno){
        return new Promise(async(resolve,reject)=>{
            let data = await Billing.findOne({
                include: [
                    {
                        model: User,
                        required: true,
                        attributes: ["fullname","firstname","middlename","lastname","email","contact","address"]
                    },
                    {
                        model: Branch,
                        required: true,
                    },{
                        model:Transaction,
                        required:true,
                        include: [
                            {
                                model: Treatment,
                                required: false,
                            },{
                                model: Billing,
                                required:false,
                            }
                        ]
                    },
                    {
                        model: Healthcard,
                        required: false,
                    }
                ], 
                where: {
                    id: idno
                },
                order: [
                    [ {model: Transaction}, { model: Treatment }, 'paymentmethod', 'DESC' ],
                    [ {model: Transaction}, {model: Billing}, 'createdAt','ASC']
                ]
            })

            resolve(data)
        })
    }

    getRecords(start,end,transactionNo,branch,userid){
        let whereclause = {}

        if(transactionNo != ""){
            whereclause.transactionNo = {
                [op.like] : `%${transactionNo}`
            }
        }else{
            whereclause = {
                [op.and]: [
                    {
                        transactionDate: {
                            [op.gte]: String(start)
                        },
                    },{
                        transactionDate: {
                            [op.lte]: String(end)
                        }
                    }
                ]
            }
            
        }

        whereclause.branchId = branch
        if(userid != "all") whereclause.userId = userid

        return new Promise(async(resolve,reject)=>{
            let data = await Transaction.findAll(
            {
                include: [
                    {
                        model: Dentist,
                        required: false,
                        attributes: ["fullname"]
                    }
                ],
                where: whereclause,
                order: [
                    ['createdAt','DESC']
                ]
            }      
            )
            resolve(data)
        })
    }


  
}

module.exports = new Transaction_()