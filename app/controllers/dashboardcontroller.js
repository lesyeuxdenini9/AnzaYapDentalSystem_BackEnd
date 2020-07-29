const controller = {}
const Sequelize = require('sequelize')
const literal = Sequelize.literal
const op = Sequelize.Op
const { Billing , sequelize , Reservation } = require('../models/index')
const { formatDate } = require('../helper/helper')

controller.getData = async (req,res,next)=>{
    const { branch } = req.params
    const todaysales = await sequelize.query("SELECT SUM(payment) as total FROM billings WHERE DATE(createdAt) = DATE(NOW()) AND branchId = ?",{replacements: [branch], type: sequelize.QueryTypes.SELECT})
    const yearsales = await sequelize.query("SELECT SUM(payment) as total FROM billings WHERE YEAR(createdAt) = YEAR(NOW()) AND branchId = ?",{replacements: [branch], type: sequelize.QueryTypes.SELECT})
    const monthsales = await sequelize.query("SELECT SUM(payment) as total FROM billings WHERE YEAR(createdAt) = YEAR(NOW()) AND MONTH(createdAt) = MONTH(NOW()) AND branchId = ?",{replacements: [branch], type: sequelize.QueryTypes.SELECT})
    const appointmenttoday = await Reservation.count({
        where: {
            [op.and]: [
                {
                    branchId: branch,
                    status: {
                        [op.notIn]: [0,2],
                    }
                },
                literal("DATE(date) = DATE(NOW())"),
            ]
            
           
        }
    })
    const lastweeksales = await sequelize.query("SELECT SUM(payment) as total,DATE(createdAt) as date FROM billings WHERE DATE(createdAt) BETWEEN DATE(NOW()-INTERVAL 7 DAY) AND DATE(NOW()-INTERVAL 1 DAY) AND branchId = ? GROUP BY DATE(createdAt)",{replacements: [branch], type: sequelize.QueryTypes.SELECT})
    const last7date = []
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    for(let x = 0 ; x<= 7 ; x++){
        let datenow = new Date()
        let otherdate = datenow.setDate(datenow.getDate()-x)
        last7date.push({date: formatDate(otherdate), sale: 0, day: dayNames[new Date(otherdate).getDay()]})
    }

  

    lastweeksales.forEach((sale)=>{
        last7date.filter((last)=>{
            if(last.date == sale.date){
                last.sale = sale.total
            }
        })
    })

    last7date.sort((a,b)=>{
        let comparison = 0;
        if (new Date(a.date) > new Date(b.date)) {
          comparison = 1;
        } else if (new Date(a.date) < new Date(b.date)) {
          comparison = -1;
        }
        return comparison;
    })

    last7date.splice(7,1)

    res.json({
        todaysales: todaysales[0].total != null ? todaysales[0].total : 0,
        yearsales: yearsales[0].total != null ? yearsales[0].total : 0,
        monthsales: monthsales[0].total != null ? monthsales[0].total : 0,
        appointmenttoday: appointmenttoday,
        weeksales: last7date,
    })
}

module.exports = controller