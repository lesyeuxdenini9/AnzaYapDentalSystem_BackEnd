const { Notification } = require('../models/index')

class Notification_ {

    getNotification({admin,userid,branch}){
        
        let whereclause = {
            isread: 0,
            isadmin: admin
        }

        if(admin == 0) whereclause.userId = userid
        if(branch != null) whereclause.branchId = branch

        return new Promise((resolve,reject)=>{
            let data = Notification.findAll({
                where: whereclause
            })
            resolve(data)
        })
      
        
    }
}

module.exports = new Notification_()