const controller = {}
const validator = require('../helper/validator')
const NotificationData = require('../dataaccess/notification')
const { Notification, sequelize } = require('../models/index')
const { response } = require('../routes/api')
const { maskzero } = require('../helper/helper')

controller.getNotification = async (req,res,next)=>{
    const { admin } = req.params
    const userinfo = await req.user
    const userid = userinfo.dataValues.id
    const branchid = userinfo.branchId

    NotificationData.getNotification({admin:admin,userid:userid,branch: branchid})
        .then((response)=>res.json({data: response}))
        .catch(err=>res.json(err))

}

controller.markasRead = (req,res,next)=>{
    const { idno } = req.params
    Notification.update({
        isread: 1
    },{
        where: {
            reservationId: idno,
            isadmin: 1,
        }
    }).then(response=>res.json({data: response}))
    .catch(err=>res.json(err))

}

controller.messageMarkasRead = (req,res,next)=>{
    const { idno } = req.params
    Notification.update({
        isread: 1
    },{
        where: {
            id: idno,
        }
    }).then(response=>res.json({data: response}))
    .catch(err=>res.json(err)) 
}

controller.markasReadpatient = (req,res,next)=>{
    const { idno } = req.params
    Notification.update({
        isread: 1
    },{
        where: {
            reservationId: idno,
            isadmin: 0,
        }
    }).then(response=>res.json({data: response}))
    .catch(err=>res.json(err))

}

controller.messageCreate = (req,res,next)=>{
    const rules = {
        "message": "required|string"
    }

    validator(req.body,rules,{}).then(async(response)=>{
        if(!response.status) {
            res.send(response.err)
        }else{
           let notifcreate = Notification.create({
               userId: req.body.User.id,
               isadmin: 0,
               TransactionId: req.body.TransactionId,
               reservationId: req.body.id,
               message: `Reservation No: ${req.body.reservationNo} ${req.body.message}`,
               targetLink: "message",
               isAnnounce: 1,
           })

           res.json(notifcreate)
        }
    })
   
}



module.exports = controller
