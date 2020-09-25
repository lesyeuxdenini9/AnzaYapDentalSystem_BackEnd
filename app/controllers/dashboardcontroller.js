const controller = {}
const Sequelize = require('sequelize')
const literal = Sequelize.literal
const op = Sequelize.Op
const { Billing , sequelize , Reservation , Dentist, User, Transaction } = require('../models/index')
const { formatDate } = require('../helper/helper')


controller.getData = async (req,res,next)=>{
    const { branch } = req.params
    const todaysales = await sequelize.query("SELECT SUM(payment) as total FROM billings WHERE DATE(createdAt) = DATE(NOW()) AND branchId = ? AND isPharmacy = 0",{replacements: [branch], type: sequelize.QueryTypes.SELECT})
    const yearsales = await sequelize.query("SELECT SUM(payment) as total FROM billings WHERE YEAR(createdAt) = YEAR(NOW()) AND branchId = ?  AND isPharmacy = 0",{replacements: [branch], type: sequelize.QueryTypes.SELECT})
    const monthsales = await sequelize.query("SELECT SUM(payment) as total FROM billings WHERE YEAR(createdAt) = YEAR(NOW()) AND MONTH(createdAt) = MONTH(NOW()) AND branchId = ?  AND isPharmacy = 0",{replacements: [branch], type: sequelize.QueryTypes.SELECT})
   

    const servicetodaycount = await sequelize.query(`SELECT s.category,COUNT(t.serviceId) as totalcount FROM ( SELECT * FROM treatments WHERE default_ = 1 AND archive = 0) t
                                                    LEFT JOIN transactions tr ON t.transactionId = tr.id
                                                    LEFT JOIN services s ON s.id = t.serviceId
                                                    WHERE tr.branchId = ? 
                                                    AND DATE(tr.transactionDate) = DATE(NOW())
                                                    AND s.category IS NOT NULL
                                                    GROUP BY s.category`,
                                                {replacements: [branch], type: sequelize.QueryTypes.SELECT})

    const serviceyearcount = await sequelize.query(`SELECT s.category,COUNT(t.serviceId) as totalcount FROM ( SELECT * FROM treatments WHERE default_ = 1 AND archive = 0) t
                                                    LEFT JOIN transactions tr ON t.transactionId = tr.id
                                                    LEFT JOIN services s ON s.id = t.serviceId
                                                    WHERE tr.branchId = ? 
                                                    AND YEAR(tr.transactionDate) = YEAR(NOW())
                                                    AND s.category IS NOT NULL
                                                    GROUP BY s.category`,
                                                {replacements: [branch], type: sequelize.QueryTypes.SELECT})

    const servicemonthcount = await sequelize.query(`SELECT s.category,COUNT(t.serviceId) as totalcount FROM ( SELECT * FROM treatments WHERE default_ = 1 AND archive = 0) t
                                                    LEFT JOIN transactions tr ON t.transactionId = tr.id
                                                    LEFT JOIN services s ON s.id = t.serviceId
                                                    WHERE tr.branchId = ? 
                                                    AND YEAR(tr.transactionDate) = YEAR(NOW())
                                                    AND MONTH(tr.transactionDate) = MONTH(NOW())
                                                    AND s.category IS NOT NULL
                                                    GROUP BY s.category`,
                                                {replacements: [branch], type: sequelize.QueryTypes.SELECT})

    const P_todaysales = await sequelize.query("SELECT SUM(payment) as total FROM billings WHERE DATE(createdAt) = DATE(NOW()) AND branchId = ? AND isPharmacy = 1",{replacements: [branch], type: sequelize.QueryTypes.SELECT})
    const P_yearsales = await sequelize.query("SELECT SUM(payment) as total FROM billings WHERE YEAR(createdAt) = YEAR(NOW()) AND branchId = ?  AND isPharmacy = 1",{replacements: [branch], type: sequelize.QueryTypes.SELECT})
    const P_monthsales = await sequelize.query("SELECT SUM(payment) as total FROM billings WHERE YEAR(createdAt) = YEAR(NOW()) AND MONTH(createdAt) = MONTH(NOW()) AND branchId = ?  AND isPharmacy = 1",{replacements: [branch], type: sequelize.QueryTypes.SELECT})
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
    const lastweeksales = await sequelize.query("SELECT SUM(payment) as total,date,isPharmacy FROM billings WHERE date BETWEEN DATE(NOW()-INTERVAL 7 DAY) AND DATE(NOW()-INTERVAL 1 DAY) AND branchId = ? GROUP BY date,isPharmacy",{replacements: [branch], type: sequelize.QueryTypes.SELECT})
    const last7date = []
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    for(let x = 0 ; x<= 7 ; x++){
        let datenow = new Date()
        let otherdate = datenow.setDate(datenow.getDate()-x)
        last7date.push({date: formatDate(otherdate), pharmacy: 0, treatment: 0, day: dayNames[new Date(otherdate).getDay()]})
    }

  

    lastweeksales.forEach((sale)=>{
        last7date.filter((last)=>{
            if(last.date == sale.date && sale.isPharmacy == 0){
                last.treatment = sale.total
            }

             if(last.date == sale.date && sale.isPharmacy == 1){
                last.pharmacy = sale.total
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
        ptodaysales: P_todaysales[0].total != null ? P_todaysales[0].total : 0,
        pyearsales: P_yearsales[0].total != null ? P_yearsales[0].total : 0,
        pmonthsales: P_monthsales[0].total != null ? P_monthsales[0].total : 0,
        appointmenttoday: appointmenttoday,
        weeksales: last7date,
        servicetodaycount: servicetodaycount,
        serviceyearcount: serviceyearcount,
        servicemonthcount: servicemonthcount,
    })
}


controller.dentistTransaction = (req,res,next)=>{
    const { branch } = req.params
    Dentist.scope("active").findAll({
        include: [
            {
                model: Transaction,
                required: false,
                right: false,
                where: {
                    status: 0,
                },
                include: [
                    {
                        model: User,
                        required: true,
                        attributes: ["fullname","id"]
                    }
                ]
            }
        ],
        where: {
            branchId: branch
        }
    }).then((response)=>{
        res.json({data: response})
    })
    .catch(err=>res.status(500).json(err)) 
}

module.exports = controller
