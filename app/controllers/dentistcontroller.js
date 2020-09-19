const controller = {}
const validator = require('../helper/validator')
const DentistData = require('../dataaccess/dentist')
const { Dentist } = require('../models/index')
const { response } = require('express')

controller.getlist = (req,res,next)=>{
    DentistData.List()
        .then((response)=>{
            res.send({data: response})
        })
        .catch((err)=>console.log(err))
}

controller.save = (req,res,next)=>{

    const rules = {
        'branch': 'required',
        'fullname': 'required|string',
        "email": "required|email|unique:dentists,email",
        'bday': 'required|date'
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const {gender, branch, fullname , email , bday, contact , address , licence, ptr} = req.body

            const newdentist = {
                gender: gender,
                branchId: branch,
                fullname: fullname,
                email: email,
                bday: bday,
                contact: contact,
                address: address,
                licence: licence,
                ptr: ptr
            }

            const dentistInfo = await Dentist.create(newdentist)
            res.json(dentistInfo)
        }
    })
}

controller.archive = async (req,res,next)=>{
    const idno = req.params.idno
    let archiveres = await Dentist.update({archive: 1},{where: {id: idno}})
    if(!archiveres)res.status(500).json("something went wrong")
    if(archiveres) res.json("archived")
}

controller.archivebystatus = async (req,res,next)=>{
    const {idno,archive} = req.params
    let archiveres = await Dentist.update({archive: archive},{where: {id: idno}})
    if(!archiveres)res.status(500).json("something went wrong")
    if(archiveres) res.json("archived")
}



controller.update = (req,res,next)=>{
    
    const rules = {
        'fullname': 'required|string',
        'bday': 'required|date'
    }

    const { email , oldemail } = req.body

    if(email != oldemail) rules.email =   "required|email|uniqueDentist:dentists,email"

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const idno = req.params.idno
            const { gender, branchId, fullname , email , bday, contact , address,  licence, ptr } = req.body

            const newdentist = {
                gender: gender,
                branchId: branchId,
                fullname: fullname,
                email: email,
                bday: bday,
                contact: contact,
                address: address,
                licence: licence,
                ptr: ptr,
            }


            let updateresult = await Dentist.update(newdentist, {where: {id: idno}})
            if(updateresult == 0) res.status(401).json("no record found")  
            let dentistInfo = await DentistData.getDentist(idno)   
            res.json(dentistInfo)
        }
    })
}

controller.search = (req,res,next)=>{
    const {search,branch} = req.body
    DentistData.search(search,branch).then((response)=>res.json({data: response})).catch(err=>res.status(500).json(err))
}


module.exports = controller
