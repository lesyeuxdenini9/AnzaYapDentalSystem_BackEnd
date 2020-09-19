const controller = {}
const validator = require('../helper/validator')
const ServiceData = require('../dataaccess/service')
const { Service } = require('../models/index')
const { response } = require('../routes/api')

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
        // 'description': 'required|string',
        'regularPrice': ['regex:/^\\d*(\\.\\d*)?$/','required','numeric'],
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const {branch, service , description , regularPrice , category } = req.body

            const newservice = {
                service: service,
                description: description,
                regularPrice: regularPrice,
                branchId: branch,
                category: category,
            }

            const serviceInfo = await Service.create(newservice)
            res.json(serviceInfo)
        }
    })
}

controller.archive = async (req,res,next)=>{
    const {idno,status} = req.params
    let archiveres = await Service.update({archive: status},{where: {id: idno}})
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
            const { branchId, service , description , regularPrice , category } = req.body

            const newservice = {
                branchId: branchId,
                service: service,
                description: description,
                regularPrice: regularPrice,
                category: category,
            }

            let updateresult = await Service.update(newservice, {where: {id: idno}})
            if(updateresult == 0) res.status(401).json("no record found")  
            let serviceInfo = await ServiceData.getService(idno)   
            res.json(serviceInfo)
        }
    })
}

controller.search = (req,res,next)=>{
    const { search , branch } = req.body
    ServiceData.search(search,branch).then((response)=>res.json({data: response})).catch(err=>res.status(500).json(err)) 
}


module.exports = controller
