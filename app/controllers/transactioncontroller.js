const controller = {}
const validator = require('../helper/validator')
const TransactionData = require('../dataaccess/transaction')
const { Stockout, Transaction, Treatment, sequelize , Action , ActionTeeth , Prescription , Prescriptitem ,User , Billing , Billitem , Medicine, Healthcard} = require('../models/index')
const { maskzero } = require('../helper/helper')
const Sequelize = require('sequelize')
const op = Sequelize.Op
const col = Sequelize.col
const { response } = require('express')
const Promise = Sequelize.Promise
const literal = Sequelize.literal
const { formatDate } = require('../helper/helper')

controller.addDiscount = (req,res,next)=>{
    const { discount , id } = req.body
    Transaction.update({
        discount: discount
    },{
        where: {
            id: id,
        }
    }).then(response=>res.json({data: response})).catch(err=>res.status(500).json(err))
}

controller.saveMedRemarks = (req,res,next)=>{
    const {message,id} = req.body
    Transaction.update({
        medRemarks: message
    },{
        where: {
            id: id,
        }
    }).then(response=>res.json({data: response})).catch(err=>res.status(500).json(err))
}

controller.getRecords = async (req,res,next)=>{
    const { start , end , transactionNo , branch , dentist, status } = req.body
    const userinfo = await req.user
    let userid = userinfo.id
    if(userinfo.usertype != 2) userid = "all"
    TransactionData.getRecords(start,end,transactionNo,branch,userid , dentist, status).then(response=>res.json({data: response})).catch(err=>res.status(500).json(err))
}

controller.viewBill = (req,res,next)=>{
    const { idno } = req.params

    TransactionData.viewBill(idno).then((response)=>res.json({data:response})).catch(err=>res.status(500).json(err))
}

controller.createBillTreatment = (req,res,next)=>{
   
    const { method , userId, customerName, totalAmountBalance, hcitems, healthcardname , healthcardNo , AccountNo, AccountName, hcpaymentTotal , cashpayment , totalAmountFinal , transactID , branchId} = req.body
    let rules = {}
    let message = {}

    if(method == "0"){
        rules.cashpayment = ['regex:/^\\d*(\\.\\d*)?$/','required','numeric']
    }else{
        rules.hcitems = "required|array"
        rules.healthcardname = "required|string"
        rules.healthcardNo = "required|string"
        rules.AccountName = "required|string"
        message['required.hcitems'] = "Choose Atleast One Treatment to be covered by Healthcard"
    }

    validator(req.body,rules,message).then(async(response)=>{
        if(!response.status){
            res.json(response.err)
        }else{

          let paymentsave = 0
          if(+method == 0){
            paymentsave = cashpayment > totalAmountBalance ? totalAmountBalance : cashpayment
          }else{
            paymentsave = hcpaymentTotal
          }

            const userinfo  = await req.user
            const createdby = userinfo.fullname
           
                sequelize.transaction(async (t) => {

                    const billdata = {
                        type: +method,
                        userId: userId,
                        customerName: customerName,
                        date: formatDate(new Date()),
                        totalAmount: totalAmountBalance,
                        payment: paymentsave,
                        change: cashpayment > totalAmountBalance ? (cashpayment-totalAmountBalance) : 0,
                        transactionId: transactID,
                        createdBy: createdby,
                        modifiedBy: createdby,
                        branchId: branchId,
                    }

                    let createbill = await Billing.create(billdata,{transaction: t})

                    let prefix = method == 1 ? "BH" : "BC"

                    let updatebill = await Billing.update({
                        billrefNo: `${prefix}${maskzero(11,createbill.id)}`
                    },{
                        where: {
                            id: createbill.id
                        },
                        transaction: t,
                    })

                    if(method == 1 || method == "1"){
                        
                            let updatetreatment = await Treatment.update({
                                paymentmethod: "healthcard"
                            },{
                                where: {
                                    id: {
                                        [op.in]: hcitems
                                    }
                                },
                                transaction: t
                            })

                            let createhealthcardinfo = await Healthcard.create({
                                healthcardno: healthcardNo,
                                healthcardname: healthcardname,
                                accountname: AccountName,
                                accountNo: AccountNo,
                                billingId: createbill.id,
                                userId: userId,
                                loadamount: hcpaymentTotal,
                            })
                    }

                }).then(result => {
                    console.log("Transaction has been committed")    
                    res.json("Transaction has been committed")       
                }).catch(err => {
                    console.log(err)
                    // console.log("Something went wrong!!")
                    res.status(500).json("Something went wrong!!")
                });
            
        }
    })


}

controller.updateActualTreatmentAmount = (req,res,next)=>{
    const { amount , id } = req.body

    Treatment.update({
        actualAmount: amount,
    },{
        where: {
            id: id
        }
    }).then((response)=>res.json({data: response}))
    .catch(err=>res.status(500).json(err))
}

controller.getlist = (req,res,next)=>{
    ServiceData.List()
        .then((response)=>{
            res.send({data: response})
        })
        .catch((err)=>console.log(err))
}

controller.getTransaction = (req,res,next)=>{
   const idno = req.params.idno
   TransactionData.getTransaction(idno)
    .then((response)=>{
        res.json({data: response})
    })
    .catch((err)=>res.json(err))
}

controller.save = (req,res,next)=>{

    const rules = {
        'branch': 'required',
        'date': 'required|date',
        'patient': 'required|integer',
        'dentistname': 'required|string',
        'servicelist': 'required|array',
        'Start': 'required|string',
        'End': 'required|string',
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const { branch, patient , servicelist , dentistid, dentistname, date , Start , End } = req.body
            
            sequelize.transaction(async (t) => {

                
                    let price = 0
                    servicelist.forEach((s)=>{
                        price = price + parseFloat(s.price)
                    })

                    const userinfo = await req.user
                    const createdby = userinfo.dataValues.fullname
                    const modifiedby = createdby


                    const transactioninfo = await Transaction.create({
                        branchId: branch,
                        transactionDate: date,
                        price: price,
                        dentist: dentistname,
                        dentistId: dentistid,
                        userId: patient,
                        createdBy: createdby,
                        modifiedBy: modifiedby, 
                        Start: Start,
                        End: End,
                    },{transaction: t})

                    let tID = transactioninfo.dataValues.id

                    const updatetransaction = await Transaction.update({
                        transactionNo: `T${maskzero(11,tID)}`
                    },{
                        where: {
                            id: transactioninfo.id
                        },
                        transaction: t
                    })

                    let services = servicelist.map((service)=>{
                        return {
                            transactionId: tID,
                            service: service.service,
                            amount: service.price,
                            actualAmount: service.price,
                            serviceId: service.id,
                        }
                    })

             let insertServices = await Treatment.bulkCreate(services,{transaction: t})

             }).then(result => {
                console.log("Transaction has been committed")    
                res.json({userid: patient})       
            }).catch(err => {
                console.log(err)
                // console.log("Something went wrong!!")
                res.status(500).json("Something went wrong!!")
            });
        }
    })
}

controller.prescriptionInfo = async (req,res,next)=>{
    const idno = req.params.idno
    TransactionData.getPrescriptInfo(idno)
     .then((response)=>{
         res.json({data: response})
     })
     .catch((err)=>res.json(err))
}

controller.prescriptInfoByRef = (req,res,next)=>{
    const refno = req.params.refno
    TransactionData.getPrescriptInfoByRef(refno)
     .then((response)=>{
         res.json({data: response})
     })
     .catch((err)=>res.json(err))
}

controller.updatePrescription = (req,res,next)=>{
    console.log(req.body)
    const rules = {
        "prescription.Prescriptitems": "required|array",
        "prescription.date": "required|date",
    }

    validator(req.body,rules,{}).then(async(response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const prescription = req.body.prescription

        let prescriptupdate = await Prescription.update({
            date: prescription.date
        },{
            where: {
                id: prescription.id,
            }
        })

        let removeOldItems = await Prescriptitem.destroy({
            where: {
                prescriptionId: prescription.id,
            }
        })

        let itemList = prescription.Prescriptitems.map((item)=>{
            return {
                prescriptionId: prescription.id,
                medicine: item.medicine,
                medicineId: item.medicineId,
                qty: parseFloat(item.qty),
                amount: item.amount,
                dosage:item.dosage,
                days: item.days,
                remarks: item.remarks         
            }
        })

        let prescriptitems = await Prescriptitem.bulkCreate(itemList)

        res.json({data: "Updated"})


        }

    })
}

controller.createPrescription = (req,res,next)=>{

    const rules = {
        "items": "required|array",
        "date": "required|date",
    }

    validator(req.body,rules,{}).then(async(response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const { tid , items, date } = req.body

            let prescription = await Prescription.create({transactionId: tid, date: date})
            let prescriptionNo = await Prescription.update({prescriptionNo: `P${maskzero(11,prescription.id)}` },{where:{id: prescription.id}})

            let itemList = items.map((item)=>{
                return {
                    prescriptionId: prescription.id,
                    medicine: item.medicine,
                    medicineId: item.id,
                    qty: parseFloat(item.qty),
                    amount: item.amount,
                    dosage:item.dosage,
                    days: item.days, 
                    remarks: item.remarks        
                }
            })
            let prescriptitems = await Prescriptitem.bulkCreate(itemList)

            res.json({data: "saved"})
        }
    })
}

controller.additionalTreatment = (req,res,next)=>{
    const rules = {
        "service": "required|string",
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const { idno } = req.params
            const { service, regularPrice , id } = req.body
            
            let transactioninfo = await Transaction.findOne({where: {id: idno}})
            let newAmount = parseFloat(transactioninfo.price) + parseFloat(regularPrice)

            let updateTransaction = await Transaction.update({
                price: newAmount
            }, {
                where: {
                    id: idno
                }
            })
            

            let addtreatment = await Treatment.create({
                transactionId: idno,
                service: service,
                amount: regularPrice,
                serviceId: id,
                actualAmount: regularPrice,
                default_: 1,
            })

            res.json({data: addtreatment})
        }
    })
    
}

controller.removePrescription = (req,res,next)=>{
    const { id } = req.body
    Prescription.update({archive: 1},{where: {id: id}})
        .then(response=>res.json(response))
        .catch(err=>console.log(err))
}

controller.removeTreatment = async (req,res,next)=>{
    const { id } = req.body

    let treatmentInfo = await Treatment.findOne({
        where: {
            id: id
        }
    })

    let transactioninfo = await Transaction.findOne({where: {id: treatmentInfo.transactionId}})
    let newAmount = parseFloat(transactioninfo.price) - parseFloat(treatmentInfo.amount)

    let updateTransaction = await Transaction.update({
        price: newAmount
    }, {
        where: {
            id: transactioninfo.id
        }
    })


    Treatment.update({archive: 1},{where: {id: id}})
        .then(response=>res.json(response))
        .catch(err=>console.log(err))

    
}

controller.editType = (req,res,next)=>{
    const idno = req.params.idno
    const { val } = req.body

    Transaction.update({toothType:val},{where: {id: idno}})
        .then(response=>res.json(response))
        .catch(err=>console.log(err))
}

controller.editStatus = async (req,res,next)=>{
    const { transactid , status, remarks } = req.body
    const userinfo = await req.user
    const modifiedby = userinfo.dataValues.fullname

    const transaction = {
        status: status,
        remarks: remarks,
        modifiedBy:modifiedby,
    }

    Transaction.update(transaction,{
        where: {
            id: transactid
        }
    }).then((response)=>{
        res.json(response)
    }).catch(err=>console.log(err))
}

controller.actionsave = (req,res,next) =>{
    const rules = {
        "diagnosis": "required|string",
        "date": "required|date",
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const { transactionId, items, treatmentid , date , diagnosis , actiontaken , starttime , endtime , affectedparts } = req.body
            const action ={
                treatmentId: treatmentid,
                date: date,
                actiontaken: actiontaken,
                diagnosis: diagnosis,
                starttime: `${date} ${starttime}`,
                endtime: `${date} ${endtime}`,
            }
            let currentstocks = []

            items.forEach(async (item)=>{
                let medicineInfo = await Medicine.findOne({
                    where: {
                        id: item.id,
                    }
                })

                currentstocks.push(medicineInfo.stocks)
            })

            const t = await sequelize.transaction()

            try {
                let stockpromises = []

                const actionsave = await Action.create(action,{transaction: t})

                let affectedpartsdata = affectedparts.map((part)=>{
                    return {
                        actionId: actionsave.dataValues.id,
                        teethId: part
                    }
                })

                let saveactionParts = await ActionTeeth.bulkCreate(affectedpartsdata,{transaction: t})
                

                let medicineused = items.map((item)=>{
                    return {
                        actionId: actionsave.id,
                        transactionId: transactionId,
                        medicineId: item.id,
                        qty: item.qty,
                    }
                })

                let savemedicineused = await Stockout.bulkCreate(medicineused,{transaction: t})

                stockpromises.push(actionsave)
                stockpromises.push(saveactionParts)
                stockpromises.push(savemedicineused)
                let x = 0
                items.forEach((item)=>{
                    let updatestocks = Medicine.update({
                        stocks: parseFloat(currentstocks[x]) - parseFloat(item.qty)
                    },{
                        where: {
                            id: item.id
                        },
                        transaction: t
                    })

                    stockpromises.push(updatestocks)
                    x++
                 })
                
                Promise.all(stockpromises).then(async()=>{
                    await t.commit()
                    console.log("Transaction has been committed")    
                    res.json({data: "success"})
                })    
            }catch (error){
                console.log(error)
                await t.rollback()
                res.status(500).json("Something went wrong!!")
            } 
           
        }

    })
}


controller.addMedicineused = (req,res,next)=>{
 
    sequelize.transaction(async (t) => {
        const { medicineId, transactID, actionId } = req.body

        let savemedicineused = await Stockout.create({
            actionId: actionId,
            transactionId: transactID,
            medicineId: medicineId,
            qty: 1
        },{transaction: t})

        let updatemedicineStocks = await Medicine.update({
            stocks: literal(`Medicines.stocks - 1`)
        },{
            where: {
                id: medicineId
            },
            transaction: t
        })

        let findsavedMedicineused = await Stockout.findOne({
            include: [
                {
                    model: Medicine,
                    required: true,
                }
            ],
            where: {
                id: savemedicineused.id,
            },
            transaction: t
        })

        res.json(findsavedMedicineused)
        
    }).then(result => {
        
        console.log("Transaction has been committed")    
    }).catch(err => {
        console.log(err)
        res.status(500).json("Something went wrong!!")
    });
}

controller.updateMedicineused = async (req,res,next)=>{

    sequelize.transaction(async (t) => {
        let dbstockoutinfo = await Stockout.findOne({
            where: {
                id: req.body.id
            }
        }) 

        
        let oldqty = dbstockoutinfo.qty
        let newqty = parseFloat(req.body.qty)

        let updatestockMed = await  Medicine.update({
            stocks: literal(`(Medicines.stocks + ${oldqty}) - ${newqty}`)
        },{
            where: {
                id: req.body.medicineId
            },
            transaction: t
        })

        let stockoutupdate = await Stockout.update({
            qty: newqty
        },{
            where : {
                id: req.body.id
            },
            transaction: t
        })


     
        Medicine.findOne({
            attributes: ["stocks"],
            where: {
                id: req.body.medicineId
            }
        }).then((response)=>{
            res.json(response)       
        }).catch(err=>console.log(err))
 

    }).then(result => {
        console.log("Transaction has been committed")    
    }).catch(err => {
        console.log(err)
        res.status(500).json("Something went wrong!!")
    });

  
}

controller.removeMedicineused = async (req,res,next)=>{
 
        let stockpromises = []
        const t = await sequelize.transaction()
        try {

            let deleteStockout = await Stockout.destroy({
                where: {
                    id: req.body.id
                },
                transaction: t
            })

            let updatestock = await Medicine.update({
                stocks: literal(`Medicines.stocks + ${req.body.qty}`)
            },{
                where:{
                    id: req.body.MedicineId
                },
                transaction: t
            })

            stockpromises.push(deleteStockout)
            stockpromises.push(updatestock)
            Promise.all(stockpromises).then(async()=>{
                await t.commit()
                console.log("Transaction has been committed")    
                res.json({data: "deleted"})
            }) 
        }catch (error){
            console.log(error)
            await t.rollback()
            res.status(500).json("Something went wrong!!")
        }
}

controller.removeaction = async (req,res,next)=>{
     let idno = req.params.idno
     let stockpromises = []
     const t = await sequelize.transaction()
     try {
        const removeaction = await Action.destroy({
            where: {
                id: idno,
            },
            transaction: t
        })
    
        const removeaction_teeth = await ActionTeeth.destroy({where: {actionId: idno},transaction: t})

        let medicineused = await Stockout.findAll({
            where: {
                actionId: idno
            }
        })

        medicineused.forEach((med)=>{
            let updatestock = Medicine.update({
                stocks: literal(`Medicines.stocks + ${med.qty}`)
            },{
                where: {
                    id: med.medicineId
                },
                transaction: t
            })

            stockpromises.push(updatestock)
        })

        let medicineusedDelete = await Stockout.destroy({
            where: {
                actionId: idno
            },
            transaction: t
        })
        
        stockpromises.push(removeaction)
        stockpromises.push(removeaction_teeth)
        stockpromises.push(medicineusedDelete)

        Promise.all(stockpromises).then(async()=>{
            await t.commit()
            console.log("Transaction has been committed")    
            res.json({data: "deleted"})
        })   
     }catch (error){
        console.log(error)
        await t.rollback()
        res.status(500).json("Something went wrong!!")
     }

}

controller.updateaction = (req,res,next)=>{
    const rules = {
        "diagnosis": "required|string",
        "date": "required|date",
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            console.log(req.body)
            const { id , date,  actiontaken, diagnosis , starttime , endtime , affectedparts } = req.body

            const action = {
                date: date,
                actiontaken: actiontaken,
                diagnosis: diagnosis,
                starttime: `${date} ${starttime}`,
                endtime: `${date} ${endtime}`,
            }   

            let updateaction = await Action.update(action,{where: {id: id}})
            let removeaction_teeth = await ActionTeeth.destroy({where: {actionId: id}})

            affectedparts.forEach((part)=>{
                let result = ActionTeeth.create({
                    actionId: id,
                    teethId: part
                })
            })

            res.json({data: "updated"})
        }

    })
}

controller.archive = async (req,res,next)=>{
    const idno = req.params.idno
    let archiveres = await Service.update({archive: 1},{where: {id: idno}})
    if(!archiveres)res.status(500).json("something went wrong")
    if(archiveres) res.json("archived")
}

controller.update = (req,res,next)=>{
    
    const rules = {
        'service': 'required|string',
        'description': 'required|string',
        'regularPrice': ['regex:/^\\d*(\\.\\d*)?$/','required','numeric']
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const idno = req.params.idno
            const { service , description , regularPrice } = req.body

            const newservice = {
                service: service,
                description: description,
                regularPrice: regularPrice,
            }

            let updateresult = await Service.update(newservice, {where: {id: idno}})
            if(updateresult == 0) res.status(401).json("no record found")  
            let serviceInfo = await ServiceData.getService(idno)   
            res.json(serviceInfo)
        }
    })
}


controller.getUserTransactionWalkIn = (req,res,next)=>{
    const {status,branch, userid } = req.params
    TransactionData.getTransactionByStatus({userid: userid,status: status,branch: branch})
    .then((response)=>res.json({data: response}))
    .catch(err=>res.json(err))
}

controller.getTransactionByStatus = async (req,res,next)=>{
    const userinfo = await req.user
    const userid = userinfo.dataValues.id
    const { status , branch } = req.params

    TransactionData.getTransactionByStatus({userid: userid,status: status,branch: branch})
        .then((response)=>res.json({data: response}))
        .catch(err=>res.json(err))
}

controller.createBillPharmarcy = (req,res,next)=>{
    const rules = {
        'payment': ['regex:/^\\d*(\\.\\d*)?$/','required','numeric']
    }

    validator(req.body,rules,{}).then(async(response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
           const { patient, items, totalAmount , payment , branch , discount} = req.body

            let currentstocks = []

            items.forEach(async (item)=>{
                let medicineInfo = await Medicine.findOne({
                    where: {
                        id: item.id,
                    }
                })

                currentstocks.push(medicineInfo.stocks)
            })

            const t = await sequelize.transaction()
            try {
                let stockpromises = []
                const userinfo = await req.user
                const createdby = userinfo.fullname
                const modifiedby = createdby
    
                let createbill = await Billing.create({
                    type: 0,
                    userId: patient.id,
                    customerName: patient.name,
                    prescriptionId: patient.prescriptionId,
                    totalAmount: totalAmount,
                    payment: totalAmount,
                    change:  parseFloat(payment) - parseFloat(totalAmount),
                    createdBy: createdby,
                    modifiedBy: modifiedby,
                    isPharmacy: 1,
                    date: formatDate(new Date()),
                    branchId: branch,
                    discount: discount,
                },{transaction: t})
    
                let updatebill = await Billing.update({
                    billrefNo: `PH${maskzero(11,createbill.id)}`
                },{
                    where: {
                        id: createbill.id
                    },
                    transaction: t,
                })
    
                let billitems = items.map((item)=>{
                    return {
                        billingId: createbill.id,
                        item: `${item.medicine} ( ${item.brand} )`,
                        description: item.description,
                        medicineId: item.id,
                        qty: parseFloat(item.quantity),
                        price: parseFloat(item.price),
                        amount: parseFloat(item.amountvalue)
                    }
                })
    
                let createbillitems = await Billitem.bulkCreate(billitems,{transaction: t})

                stockpromises.push(createbill)
                stockpromises.push(updatebill)
                stockpromises.push(createbillitems)
                let x = 0
                items.forEach((item)=>{
                    let updatestocks = Medicine.update({
                        stocks: parseFloat(currentstocks[x]) - parseFloat(item.quantity)
                    },{
                        where: {
                            id: item.id
                        },
                        transaction: t
                    })

                    stockpromises.push(updatestocks)
                    x++
                 })

                Promise.all(stockpromises).then(async()=>{
                    await t.commit()
                    console.log("Transaction has been committed")    
                    res.json({data: createbill.id})     
                })     
            }catch (error) {
                console.log(error)
                await t.rollback()
                res.status(500).json("Something went wrong!!")
            }
        }
    })
}

controller.getPastListPharmacy = (req,res,next)=>{
    TransactionData.getPastListPharmacy(req.body).then(response=>res.json({data: response})).catch(err=>res.status(500).json(err))

}

module.exports = controller
