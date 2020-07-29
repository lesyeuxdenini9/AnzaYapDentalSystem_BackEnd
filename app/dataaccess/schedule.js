const { Schedule } = require('../models/index')

class Schedule_ {

    getList() {
        return new Promise((resolve,reject)=>{
            let data = Schedule.findAll()
            resolve(data)
        })
    }

    getSchedulesByBranch(id){
        return new Promise(async(resolve,reject)=>{
            let data = await Schedule.findAll({
                where: {
                    branchId: id
                }
            })
            resolve(data)
        })
    }

}

module.exports = new Schedule_()