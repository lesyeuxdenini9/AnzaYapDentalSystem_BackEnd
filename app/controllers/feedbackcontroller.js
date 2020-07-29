const controller = {}
const Sequelize = require('sequelize')
const op = Sequelize.Op
const literal = Sequelize.literal
const { Feedback , User } = require('../models/index')
const validator = require('../helper/validator')
const { response } = require('../routes/api')
const branch = require('../dataaccess/branch')

controller.patientget = async (req,res,next)=>{
    const { branch } = req.params
    
    const userinfo = await req.user
    const userid = userinfo.id

    let getData = await Feedback.findAll({
        where: {
            branchId: branch,
            userId: userid
        },
        order: [
            ['createdAt','DESC']
        ]
    })

    res.json({data: getData})
}

controller.adminget = async (req,res,next)=>{
    const { branch } = req.params

    let getData = await Feedback.findAll({
        include:[
            {
                model: User,
                required: true,
                attributes: ["fullname","firstname","middlename","lastname","email","img"],
            }
        ],
        where: {
            [op.and]: [
                literal("MONTH(Feedback.createdAt) = MONTH(NOW()) AND YEAR(Feedback.createdAt) = YEAR(NOW())"),
                {branchId: branch},
            ]
            
        },
        order: [
            ['createdAt','DESC']
        ]
    })

    res.json({data: getData})
}

controller.save = (req,res,next)=>{
 
    const rules = {
        "branch": "required"
    }

    validator(req.body,rules,{}).then(async(response)=>{
        if(!response.status){
            res.send(response.err)
        }else{
            const { branch, comment, stars } = req.body
            let userinfo = await req.user
            let userid = userinfo.id
            let startcount = 0

            stars.forEach((s)=>{
                if(s.check == 1) startcount = startcount+1
            })

           
            let createfeedback = await Feedback.create({
                userId: userid,
                branchId: branch,
                message: comment,
                star: startcount,
            })
            res.json({data:createfeedback})
        }
    })
}


controller.remove = (req,res,next)=>{
    const { idno } = req.params

    Feedback.destroy({
        where: {
            id: idno
        }
    }).then(response=>res.json("Successfully Deleted"))
    .catch(err=>res.status(500).json(err))
}


module.exports = controller