const { Medicine , Stockin , Stockinitem , Stockout, Transaction , Action, Treatment , Dentist , Billitem , Billing} = require('../models/index')
const Sequelize = require('sequelize')
const op = Sequelize.Op
const literal = Sequelize.literal
class Medicine_ {

    search(search,branch,type){
        return new Promise((resolve,reject)=>{
            let data = Medicine.findAll({
                where: {
                    branchId: branch,
                    type: type,
                    [op.or]: [
                        {
                            medicine: {
                                [op.like]: `%${search}%`
                            }
                        },
                        {
                            code: {
                                [op.like]: `%${search}%`
                            } 
                        }
                    ]
                }
            })
            resolve(data)
        })
    }
 
    List(branch,type){
        return new Promise((resolve,reject)=>{
            let services = Medicine.scope("active").findAll({
                where: {
                    branchId: branch,
                    type: type
                }
            })
            resolve(services)
        })
    }

    getMedicine(idno){
        return new Promise((resolve,reject)=>{
            let data = Medicine.scope(["active"]).findOne({where: {id: idno}})
            resolve(data)
        })
    }

    getStocksin(start,end,reference,branch,isPharmacy){
        let whereclause = {}
        if(reference != ""){
            whereclause = {
                [op.or]: [
                    {
                        refno: {
                            [op.like] : `%${reference}`
                        }
                    },{
                        invoiceRefno: {
                            [op.like] : `%${reference}`
                        }
                    }
                ]
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
            
        }

        whereclause.branchId = branch
        whereclause.isPharmacy = isPharmacy

        console.log(whereclause)

        return new Promise(async (resolve,reject)=>{
            let data = await Stockin.findAll({
                include: [
                    {
                        model: Stockinitem,
                        required: false,
                    }
                ],
                where: whereclause,
                order: [
                    ['createdAt','DESC']
                ]
            })

            resolve(data)
        })
    }

    getInfo( start , end , id ){
        return new Promise(async(resolve,reject)=>{
            let data = await Medicine.findOne({
                include: [
                    {
                        model: Stockinitem,
                        required: false,
                        include: [
                            {
                                model: Stockin,
                                required: true,
                                where: {
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
                            }, // end model stockin
                        ]
                    },
                    {
                        model: Stockout,
                        required: false,
                        where: {
                            [op.and]: [
                                literal(`DATE(Stockouts.createdAt) >= '${String(start)}' AND DATE(Stockouts.createdAt) <= '${String(end)}'`)
                            ]
                        },
                        include: [
                            {
                                model: Transaction,
                                required: true,
                                include: [{
                                    model: Dentist,
                                    required: true
                                }]
                            },
                            {
                                model: Action,
                                required: true,
                                include: [
                                    {
                                        model: Treatment,
                                        required: true,
                                    }
                                ]
                            },
                            {
                                model: Medicine,
                                required: true,
                            }
                        ]
                    },
                    {
                        model: Billitem,
                        required: false,
                        include: [
                            {
                            model: Billing,
                            required: true,
                            attributes: ["billrefNo","createdAt","updatedAt","createdBy","modifiedBy"]
                            },
                            {
                                model: Medicine,
                                required: true,
                                attributes: ["uom"]
                            }
                        ],
                        where: {
                            [op.and]: [
                                literal(`DATE(Billitems.createdAt) >= '${String(start)}' AND DATE(Billitems.createdAt) <= '${String(end)}'`)
                            ]
                        },
                    }
                ],
                where: {
                    id: id
                },
                order: [
                    [{model: Stockinitem},{model: Stockin},"date","ASC"],
                    [{model: Stockout},"createdAt","ASC"],
                    [{model: Billitem},{model: Billing}, "createdAt","ASC"]
                ]
            })

            resolve(data)
        })
    }

    stockinfo(refno,medid){
        return new Promise((resolve,reject)=>{
            let data = Stockin.findOne({
                include: [
                    {
                        model: Stockinitem,
                        where: {
                            medicineId: medid,
                        }
                    }
                ],  
                where: {
                    refno:{
                        [op.like]:`%${refno}%`
                    }
                }
            })

            resolve(data)
        })
    }
  
}



module.exports = new Medicine_()