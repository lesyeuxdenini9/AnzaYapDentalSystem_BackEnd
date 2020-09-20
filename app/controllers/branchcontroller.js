const controller = {}
const validator = require('../helper/validator')
const BranchData = require('../dataaccess/branch')
const { Branch , Schedule } = require('../models/index')
const { response } = require('express')


controller.save = (req,res,next)=>{
    const { branch , address , contact , email ,tin , vat } = req.body
    const rules = {
        "branch": "required|string",
        "address": "required|string",
    }

    validator(req.body,rules,{}).then(async(response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            Branch.create({
                branch: branch,
                address: address,
                contact: contact,
                email: email,
                tin: tin,
                vat: vat,
            }).then(async (response)=>{
                let schedules = []
                let schedulesdes = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
                for(let x = 0 ; x <=6 ; x++){
                    schedules.push({
                        index: x,
                        day: schedulesdes[x],
                        branchId: response.id
                    })
                }

                let schedulessave = await Schedule.bulkCreate(schedules)

                res.json(response)
            }).catcth(err=>res.status(500).json(err))
        
        }
    })

 
}

controller.publicList =  (req,res,next)=>{
    BranchData.publicList()
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}


controller.list = async (req,res,next)=>{
    const userinfo = await req.user
    const branchid = userinfo.branchId
    BranchData.list(branchid)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.listbyarchive = async (req,res,next)=>{
    const userinfo = await req.user
    const branchid = userinfo.branchId
    let archivestatus = req.params.archive == "true" ? 0 : 1
    BranchData.listbyarchive(branchid,archivestatus)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.getListUser = async (req,res,next)=>{
    const { type } = req.params
    const userinfo = await req.user
    const branchid = userinfo.branchId
    BranchData.getListUser(branchid,type)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.getListUserbyArchive = async (req,res,next)=>{
    const { type , archive } = req.params
    const userinfo = await req.user
    const branchid = userinfo.branchId
    BranchData.getListUserbyArchive(branchid,type, archive)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.getListMedicine = async (req,res,next)=>{
    const { type } = req.params
    const userinfo = await req.user
    const branchid = userinfo.branchId
    BranchData.getListMedicine(branchid,type)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.getListMedicineByArchive = async (req,res,next)=>{
    const { type, archive } = req.params
    const userinfo = await req.user
    const branchid = userinfo.branchId
    let archivestatus = archive == "true" ? 0 : 1
    BranchData.getListMedicineByArchive(branchid,type,archivestatus)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.getListService = async (req,res,next)=>{
    const userinfo = await req.user
    const branchid = userinfo.branchId
    BranchData.getListService(branchid)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.getListServiceByArchive = async (req,res,next)=>{
    const userinfo = await req.user
    const branchid = userinfo.branchId
    const {archive} = req.params
    let archivestatus = archive == "true" ? 0 : 1
    BranchData.getListServiceByArchive(branchid,archivestatus)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.getListDentist = async (req,res,next)=>{
    const userinfo = await req.user
    const branchid = userinfo.branchId
    BranchData.getListDentist(branchid)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.getListDentistbyArchive = async (req,res,next)=>{
    const userinfo = await req.user
    const branchid = userinfo.branchId
    let archive = req.params.archive == "true" ? 0 : 1
    BranchData.getListDentistbyArchive(branchid,archive)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}


controller.getListAllInfo = async (req,res,next)=>{
    const userinfo = await req.user
    const branchid = userinfo.branchId
    BranchData.getListAllInfo(branchid)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.getInfo = (req,res,next)=>{
    const { idno , type }  = req.params
    BranchData.getInfo(idno, type)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.remove = (req,res,next)=>{
    Branch.update({
        archive:1,
    },{
        where: {
            id: req.body.id
        }
    }).then(response=>res.json({data:response}))
    .catch(err=>res.status(500).json(err))
}

controller.archivelist = (req,res,next)=>{
    Branch.update({
        archive:req.body.archive,
    },{
        where: {
            id: req.body.id
        }
    }).then(response=>res.json({data:response}))
    .catch(err=>res.status(500).json(err))
}

controller.update = (req,res,next)=>{
    const { branch , address , contact , email , id , tin , vat} = req.body
    const rules = {
        "branch": "required|string",
        "address": "required|string",
    }

    validator(req.body,rules,{}).then(async(response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            Branch.update({
                branch: branch,
                address: address,
                contact: contact,
                email: email,
                tin: tin,
                vat: vat,
            },{
                where: {
                    id: id
                }
            }).then(response=>res.json({data:response}))
            .catch(err=>res.status(500).json(err))
        }
    })
}

controller.search = (req,res,next)=>{
    const { branch } = req.params
    BranchData.search(branch).then(response=>res.json({data: response})).catch(err=>res.status(500).json(err))
}


module.exports = controller