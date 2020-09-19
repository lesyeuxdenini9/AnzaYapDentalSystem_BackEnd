const controller = {}
const validator = require('../helper/validator')
const MedicineData = require('../dataaccess/medicine')
const { Medicine , Stockin , Stockinitem , sequelize} = require('../models/index')
const { response } = require('express')
const { maskzero } = require('../helper/helper')


controller.getInfo = (req,res,next)=>{
    const { start , end , id } = req.body
    MedicineData.getInfo( start , end , id ).then(response=>res.json({data: response})).catch(err=>res.status(500).json(err))
}

controller.getStocksin = (req,res,next) => {
    const { start , end , reference , branch , isPharmacy } = req.body
    MedicineData.getStocksin(start,end,reference,branch , isPharmacy).then(response=>res.json({data: response})).catch(err=>res.status(500).json(err))
}


controller.getlist = (req,res,next)=>{
    const { branch , type } = req.params
    MedicineData.List(branch,type)
        .then((response)=>{
            res.send({data: response})
        })
        .catch((err)=>console.log(err))
}

controller.addstock = (req,res,next)=>{
    const rules = {
        "items": "required|array",
    }

    validator(req.body,rules,{}).then(async(response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const { branch, date, supplier , invoiceRef , items , isPharmacy } = req.body
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

                let createstockin = await Stockin.create({
                    date: date,
                    manufacturer: supplier,
                    invoiceRefno: invoiceRef,
                    branchId: branch,
                    isPharmacy: isPharmacy
                },{transaction: t})
               
                let updatestockref = await Stockin.update({
                    refno: `SI${req.app.parent.locals.maskzero(11,createstockin.id)}`
                },{
                    where: {
                        id: createstockin.id,
                    },
                    transaction: t
                })

                let stockitems = items.map((item)=>{
                    return {
                        stockinId: createstockin.id,
                        medicineId: item.id,
                        medicine: item.medicine,
                        qty: item.qty,
                        uom: item.uom,
                        ExpirationDate: item.expirationDate,
                    }
                })

                let insertstockitems = await Stockinitem.bulkCreate(stockitems,{transaction: t})

                stockpromises.push(createstockin)
                stockpromises.push(updatestockref)
                stockpromises.push(insertstockitems)

                let x = 0
                items.forEach((item)=>{
                    let updatestocks = Medicine.update({
                        stocks: parseFloat(currentstocks[x]) + parseFloat(item.qty)
                    },{
                        where: {
                            id: item.id
                        },
                        transaction: t
                    })

                    stockpromises.push(updatestocks)
                    x++
                 })


                // console.log(req.app.parent.locals.testvar)
                Promise.all(stockpromises).then(async()=>{
                    await t.commit()
                    console.log("Transaction has been committed")    
                    res.json({msg: "Transaction has been committed"})     
                })     
            }catch(error){
                console.log(error)
                await t.rollback()
                res.status(500).json("Something went wrong!!")
            }
        }
    })
}

controller.save = (req,res,next)=>{

    const rules = {
        'branch': 'required',
        'medicine': 'required|string',
        'description': 'required|string',
        'limit': 'required|numeric',
        'brand': 'required|string',
        'price': ['regex:/^\\d*(\\.\\d*)?$/','required','numeric'],
    }

    const message = {
        "required.limit":"The Minimum field is required"
    }

    validator(req.body,rules,message).then(async (response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const { uom , branch , medicine , description , price, manufacturer , code , limit , type , scientific , brand } = req.body

            const newmedicine = {
                limitMin: limit,
                uom: uom,
                branchId: branch,
                medicine: medicine,
                description: description,
                price: price,
                manufacturer: manufacturer,
                code: code,
                type: type,
                scientificName: scientific,
                brand: brand, 
            }

            const medicineInfo = await Medicine.create(newmedicine)
            res.json(medicineInfo)
        }
    })
}

controller.archive = async (req,res,next)=>{
    const idno = req.params.idno
    let archiveres = await Medicine.update({archive: 1},{where: {id: idno}})
    if(!archiveres)res.status(500).json("something went wrong")
    if(archiveres) res.json("archived")
}


controller.retrieve = async (req,res,next)=>{
    const idno = req.params.idno
    let archiveres = await Medicine.update({archive: 0},{where: {id: idno}})
    if(!archiveres)res.status(500).json("something went wrong")
    if(archiveres) res.json("archived")
}

controller.update = (req,res,next)=>{
    
    const rules = {
        'medicine': 'required|string',
        'description': 'required|string',
        'limitMin': 'required|numeric',
        'brand': 'required|string',
        'price': ['regex:/^\\d*(\\.\\d*)?$/','required','numeric']
    }

    const message = {
        "required.limitMin":"The Minimum field is required"
    }

    validator(req.body,rules,message).then(async (response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const idno = req.params.idno
            const { medicine , description , price, manufacturer, stocks , code , limit , scientificName , brand , uom } = req.body

            const newmedicine = {
                limitMin: limit,
                medicine: medicine,
                description: description,
                price: price,
                manufacturer: manufacturer,
                code: code,
                stocks: stocks, // temp update of stocks should rely on add stocks and reduce stocks module
                brand: brand,
                scientificName: scientificName,
                uom: uom,
            }

            let updateresult = await Medicine.update(newmedicine, {where: {id: idno}})
            if(updateresult == 0) res.status(401).json("no record found")  
            let medicineInfo = await MedicineData.getMedicine(idno)   
            res.json(medicineInfo)
        }
    })
}

controller.search = (req,res,next)=>{
    const {search,branch,type} = req.body
    MedicineData.search(search,branch,type).then(response=>res.json({data: response})).catch(err=>res.status(500).json(err))
}


controller.stockinfo = (req,res,next)=>{
    const { refno , medid } = req.body
    MedicineData.stockinfo(refno,medid).then(response=>res.json({data: response})).catch(err=>res.status(500).json(err))
}

module.exports = controller
