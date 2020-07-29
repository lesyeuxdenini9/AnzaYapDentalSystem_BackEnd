const controller = {}
const validator = require('../helper/validator')
const ServiceData = require('../dataaccess/service')
const { Service } = require('../models/index')

controller.getlist = (req,res,next)=>{
    const { branch } = req.params
    ServiceData.List(branch)
        .then((response)=>{
            res.send({data: response})
        })
        .catch((err)=>console.log(err))
}

controller.save = (req,res,next)=>{

    const rules = {
        'branch': 'required',
        'service': 'required|string',
        'description': 'required|string',
        'regularPrice': ['regex:/^\\d*(\\.\\d*)?$/','required','numeric'],
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const {branch, service , description , regularPrice } = req.body

            const newservice = {
                service: service,
                description: description,
                regularPrice: regularPrice,
                branchId: branch,
            }

            const serviceInfo = await Service.create(newservice)
            res.json(serviceInfo)
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
            const { branchId, service , description , regularPrice } = req.body

            const newservice = {
                branchId: branchId,
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


module.exports = controller