const controller = {}
const validator = require('../helper/validator')
const ScheduleData = require('../dataaccess/schedule')
const { Schedule } = require('../models/index')
const { response } = require('../routes/api')

controller.getSchedules = (req,res,next)=>{
    ScheduleData.getList()
        .then((response)=>{
            res.send({data: response})
        })
        .catch((err)=>console.log(err))
}

controller.getSchedulesByBranch = (req,res,next)=>{
    const { branchid } = req.params
    ScheduleData.getSchedulesByBranch(branchid)
        .then((response)=>{
            res.send({data: response})
        })
        .catch((err)=>console.log(err))
}

controller.updateSchedule = (req,res,next)=>{

    const { start, end, id , active } = req.body
    Schedule.update({
        start: start,
        end: end,
        active:active
    },{
        where: {
            id: id
        }
    }).then((response)=>res.json(response))
    .catch(err=>console.log(err))
}


module.exports = controller
