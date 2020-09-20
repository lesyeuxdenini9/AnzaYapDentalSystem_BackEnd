const controller = {}
const validator = require('../helper/validator')
const { Billing , Transaction , Dentist , User, sequelize , Billitem , Treatment , Service} = require('../models/index')
const Sequelize = require('sequelize')
const { STRING } = require('sequelize')
const { response } = require('express')
const op = Sequelize.Op
const literal = Sequelize.literal
const fn = Sequelize.fn
const col = Sequelize.col

controller.pharmacyPurchaseRecords = (req,res,next)=>{
    const { start , end , refno , branch } = req.body
    console.log(req.body)
    let whereclause = {}
    if(refno != ""){
        whereclause.billrefNo = {
            [op.like] : `%${refno}`
        }
    }else{
        whereclause = {
            [op.and]: [
                literal(`DATE(billing.createdAt) >= '${start}' AND DATE(billing.createdAt) <= '${end}'`)
            ]
        }
        
    }

    whereclause.branchId = branch
    whereclause.isPharmacy = 1
    Billing.findAll({include: [{model: Billitem,required: true}],where: whereclause,order: [["createdAt","ASC"]]}).then(response=>res.json({data: response})).catch(err=>res.status(500).json(err))
}

controller.billingRecords = (req,res,next)=>{
    const { start , end , refno , branch } = req.body

    let whereclause = {}
    if(refno != ""){
        whereclause.billrefNo = {
            [op.like] : `%${refno}`
        }
    }else{
        whereclause = {
            [op.and]: [
                {
                    date: {
                        [op.gte]: String(start)
                    },
                },{
                    date: {
                        [op.lte]: String(end)
                    }
                }
            ]
        }
        
    }

    whereclause.branchId = branch
    whereclause.isPharmacy = 0

    Billing.findAll(
        {
            include: [
                {
                    model: Transaction,
                    include: [
                        {
                            model: Dentist,
                            attributes: ["fullname"]
                        }
                    ]
                },
                {
                    model: User,
                    attributes: ["fullname"]
                }
            ],
            where: whereclause,
            order: [
                ['createdAt','DESC']
            ]
        }      
        ).then(response=>res.json({data: response}))
        .catch(err=>res.status(500).json(err))
}

controller.pharmacy_daily = async (req,res,next)=>{
    const { start ,end , branch } = req.body
    let query = `SELECT SUM(payment) AS totalsales,date FROM billings 
                WHERE date >= '${start}' AND date <= '${end}' 
                AND branchId = ${branch}
                AND isPharmacy = 1
                GROUP BY date 
                ORDER BY date ASC`

    let salesdaily = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    query = `SELECT i.uom,bi.item,bi.description,SUM(bi.qty) as totalcount
            FROM billitems bi
            LEFT JOIN billings b ON b.id = bi.billingId
            LEFT JOIN medicines i ON bi.medicineId = i.id
            WHERE b.branchId = ${branch} AND ( b.date >= '${start}' AND b.date <= '${end}')
            GROUP BY bi.medicineId
            ORDER BY totalcount DESC`
    let servicegraphAvail = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    res.json({graph: salesdaily, serviceMostavail: servicegraphAvail})
}

controller.pharmacy_monthly = async (req,res,next)=>{
    const { startmonth , startyear , endmonth , endyear , branch } = req.body

    let query = `SELECT SUM(payment) AS totalsales,MONTH(date) as monthname,YEAR(date) as yearname
                FROM billings
                WHERE (MONTH(date) >= ${startmonth} AND YEAR(date) >= ${startyear})
                AND (MONTH(date) <= ${endmonth} AND YEAR(date) <= ${endyear})
                AND branchId = ${branch}
                AND isPharmacy = 1
                GROUP BY MONTH(date),YEAR(date)
                ORDER BY YEAR(date) ASC,MONTH(date) ASC`
    let salesmonthly = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    query = `SELECT i.uom,bi.item,bi.description,SUM(bi.qty) as totalcount
            FROM billitems bi
            LEFT JOIN billings b ON b.id = bi.billingId
            LEFT JOIN medicines i ON bi.medicineId = i.id
            WHERE b.branchId = ${branch} AND ( MONTH(b.date) >= '${startmonth}' AND YEAR(b.date) >= '${startyear}')
            AND  ( MONTH(b.date) <= '${endmonth}' AND YEAR(b.date) <= '${endyear}')
            GROUP BY bi.medicineId
            ORDER BY totalcount DESC`

    let servicegraphAvail = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    res.json({graph: salesmonthly,serviceMostavail: servicegraphAvail})
}

controller.pharmacy_yearly = async (req,res,next)=>{
    const {  startyear , endyear , branch } = req.body
    let query = `SELECT SUM(payment) AS totalsales,YEAR(date) as yearname
                 FROM billings
                 WHERE YEAR(date) >= ${startyear} AND YEAR(date) <= ${endyear}
                 AND branchId = ${branch}
                 AND isPharmacy = 1
                 GROUP BY YEAR(date)
                 ORDER BY YEAR(date) ASC`
    let salesyearly = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    query = `SELECT i.uom,bi.item,bi.description,SUM(bi.qty) as totalcount
            FROM billitems bi
            LEFT JOIN billings b ON b.id = bi.billingId
            LEFT JOIN medicines i ON bi.medicineId = i.id
            WHERE b.branchId = ${branch} AND ( YEAR(b.date) >= '${startyear}' AND YEAR(b.date) <= '${endyear}')
            GROUP BY bi.medicineId
            ORDER BY totalcount DESC`

    let servicegraphAvail = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    res.json({graph: salesyearly,serviceMostavail: servicegraphAvail})
}

const getDentistData = (whereclause,branch)=>{
    return new Promise(async (resolve)=>{
        let data = await Dentist.scope("active").findAll({
            include: [
                {
                    model: Transaction,
                    required: false,
                    attributes: ["transactionNo","transactionDate","status","discount"],
                    include: [
                        {
                            model: Billing,
                            required: false,
                            attributes:  [
                                "date",
                                "payment"
                            ],
    
                        },
                        {
                            model: Treatment.scope("default","active"),
                            required: true,
                            attributes: [
                                "service",
                                "amount",
                                "discount",
                                "actualAmount",
                                "paymentMethod",
                            ]
    
                        },
                        {
                            model: User,
                            required: true,
                            attributes: ["fullname"]
                        }
         
                    ],
                    where: whereclause
                }
            ],
            where: {
                branchId: branch
            },
            order: [
                [ {model: Transaction}, 'transactionDate', 'ASC']
            ]
        })
        resolve(data)
    })
   
}

controller.getByGender = async (req,res,next)=>{

    const { search , service, flag } = req.body
    let genderData
    let query

    if(flag == 1){
        query = `SELECT tr.transactionDate,COUNT(CASE WHEN u.gender = 'Male' THEN u.gender END) as MaleCount, COUNT(CASE WHEN u.gender = 'Female' THEN u.gender END) as FemaleCount 
                     FROM transactions tr 
                     LEFT JOIN treatments t ON t.transactionId = tr.id AND t.default_ = 1 AND t.archive = 0
                     LEFT JOIN users U ON u.id = tr.userId
                     WHERE tr.branchId = ${search.branch} AND ( tr.transactionDate >= '${search.start}' AND tr.transactionDate <= '${search.end}') AND t.serviceId = ${service.serviceId}
                     GROUP BY tr.transactionDate`
        
    }else if(flag == 2){
        query = `SELECT MONTH(tr.transactionDate) as monthname,YEAR(tr.transactionDate) as yearname,COUNT(CASE WHEN u.gender = 'Male' THEN u.gender END) as MaleCount, COUNT(CASE WHEN u.gender = 'Female' THEN u.gender END) as FemaleCount 
                FROM transactions tr 
                LEFT JOIN treatments t ON t.transactionId = tr.id AND t.default_ = 1 AND t.archive = 0
                LEFT JOIN users U ON u.id = tr.userId
                WHERE tr.branchId = ${search.branch} AND ( MONTH(tr.transactionDate) >= '${search.startmonth}' AND YEAR(tr.transactionDate) >= '${search.startyear}')
                AND  ( MONTH(tr.transactionDate) <= '${search.endmonth}' AND YEAR(tr.transactionDate) <= '${search.endyear}') 
                AND t.serviceId = ${service.serviceId}
                GROUP BY YEAR(tr.transactionDate),MONTH(tr.transactionDate)`
    }else{
        query = `SELECT YEAR(tr.transactionDate) as yearname,COUNT(CASE WHEN u.gender = 'Male' THEN u.gender END) as MaleCount, COUNT(CASE WHEN u.gender = 'Female' THEN u.gender END) as FemaleCount 
                FROM transactions tr 
                LEFT JOIN treatments t ON t.transactionId = tr.id AND t.default_ = 1 AND t.archive = 0
                LEFT JOIN users U ON u.id = tr.userId
                WHERE tr.branchId = ${search.branch} AND ( YEAR(tr.transactionDate) >= '${search.startyear}' AND YEAR(tr.transactionDate) <= '${search.endyear}')
                AND t.serviceId = ${service.serviceId}
                GROUP BY YEAR(tr.transactionDate)`
    }

    genderData = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    res.json({genderData: genderData})
 
}


controller.sales_daily = async (req,res,next)=>{
    const { start ,end , branch } = req.body
    let query = `SELECT SUM(payment) AS totalsales,date FROM billings 
                 WHERE date >= '${start}' AND date <= '${end}' 
                 AND branchId = ${branch}
                 AND isPharmacy = 0
                 GROUP BY date 
                 ORDER BY date ASC`
    let salesdaily = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    query = `SELECT t.serviceId,s.service,s.category,COUNT(t.serviceId) as totalcount 
             FROM ( SELECT * FROM treatments WHERE default_ = 1 AND archive = 0 ) t 
             LEFT JOIN transactions tr ON t.transactionId = tr.id 
             LEFT JOIN services s ON s.id = t.serviceId 
             WHERE tr.branchId = ${branch} AND ( tr.transactionDate >= '${start}' AND tr.transactionDate <= '${end}') AND s.id <> 0
             GROUP BY t.serviceId
             ORDER BY totalcount DESC`
    let servicegraphAvail = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    query = `SELECT t.serviceId,s.service,s.category,SUM(b.payment) as totalearn 
             FROM ( SELECT * FROM treatments WHERE default_ = 1 AND archive = 0 ) t 
             LEFT JOIN transactions tr ON t.transactionId = tr.id 
             LEFT JOIN billings b ON b.transactionId = tr.id
             LEFT JOIN services s ON s.id = t.serviceId 
             WHERE b.branchId = ${branch} AND ( b.date >= '${start}' AND b.date <= '${end}')
             GROUP BY t.serviceId
             ORDER BY totalearn DESC`

    let servicegrapEarn = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    let servicearray = servicegrapEarn.map((service)=>{
        return service.serviceId
    })

    let dentistdata = await getDentistData({
        [op.and]: [
            {
                transactionDate: {
                    [op.gte]: String(start)
                },
            },{
                transactionDate: {
                    [op.lte]: String(end)
                }
            }
        ]
    },branch)    
   
    res.json({graph: salesdaily, serviceMostavail: servicegraphAvail ,serviceMostEarn: servicegrapEarn, dentistdata: dentistdata })
}


controller.sales_monthly = async (req,res,next)=>{
    const { startmonth , startyear , endmonth , endyear , branch } = req.body
    let query = `SELECT SUM(payment) AS totalsales,MONTH(date) as monthname,YEAR(date) as yearname
                 FROM billings
                 WHERE (MONTH(date) >= ${startmonth} AND YEAR(date) >= ${startyear})
                 AND (MONTH(date) <= ${endmonth} AND YEAR(date) <= ${endyear})
                 AND branchId = ${branch}
                 AND isPharmacy = 0
                 GROUP BY MONTH(date),YEAR(date)
                 ORDER BY YEAR(date) ASC,MONTH(date) ASC`
    let salesmonthly = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    query = `SELECT t.serviceId,s.service,s.category,COUNT(t.serviceId) as totalcount 
            FROM ( SELECT * FROM treatments WHERE default_ = 1 AND archive = 0 ) t  
            LEFT JOIN transactions tr ON t.transactionId = tr.id 
            LEFT JOIN services s ON s.id = t.serviceId 
            WHERE tr.branchId = ${branch} AND ( MONTH(tr.transactionDate) >= '${startmonth}' AND YEAR(tr.transactionDate) >= '${startyear}') AND s.id <> 0
            AND  ( MONTH(tr.transactionDate) <= '${endmonth}' AND YEAR(tr.transactionDate) <= '${endyear}')
            GROUP BY t.serviceId
            ORDER BY totalcount DESC`

    let servicegraphAvail = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})


    let dentistdata = await getDentistData({
        [op.and]: [
          literal(`( MONTH(transactionDate) >= ${startmonth}  AND YEAR(transactionDate) >= ${startyear})`),
          literal(`( MONTH(transactionDate) <= ${endmonth}  AND YEAR(transactionDate) <= ${endyear})`),
        ]
    },branch)    

    res.json({graph: salesmonthly,serviceMostavail: servicegraphAvail , dentistdata: dentistdata })
}

controller.sales_yearly = async (req,res,next)=>{
    const {  startyear , endyear , branch } = req.body
    let query = `SELECT SUM(payment) AS totalsales,YEAR(date) as yearname
                 FROM billings
                 WHERE YEAR(date) >= ${startyear} AND YEAR(date) <= ${endyear}
                 AND branchId = ${branch}
                 AND isPharmacy = 0
                 GROUP BY YEAR(date)
                 ORDER BY YEAR(date) ASC`
    let salesyearly = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    query = `SELECT t.serviceId,s.service,s.category,COUNT(t.serviceId) as totalcount 
            FROM ( SELECT * FROM treatments WHERE default_ = 1 AND archive = 0 ) t 
            LEFT JOIN transactions tr ON t.transactionId = tr.id 
            LEFT JOIN services s ON s.id = t.serviceId 
            WHERE tr.branchId = ${branch} AND ( YEAR(tr.transactionDate) >= '${startyear}' AND YEAR(tr.transactionDate) <= '${endyear}') AND s.id <> 0
            GROUP BY t.serviceId
            ORDER BY totalcount DESC`

    let servicegraphAvail = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})


    let dentistdata = await getDentistData({
        [op.and]: [
          literal(`( YEAR(transactionDate) >= ${startyear}  AND YEAR(transactionDate) <= ${endyear})`),
        ]
    },branch)    

    res.json({graph: salesyearly,serviceMostavail: servicegraphAvail,dentistdata: dentistdata })
}



controller.appointment_daily = async (req,res,next)=>{
    const { start ,end , branch } = req.body

    let query = `SELECT r.date,
                COUNT(r.status) AS totalcount,
                COUNT(CASE WHEN r.isResched = 0 AND (r.status = 2 OR r.status = 3) THEN r.status END) AS Cancelled,
                COUNT(CASE WHEN r.isResched = 0 AND (r.status = 1 OR r.status = 4) THEN r.status END) AS Approved,
                COUNT(CASE WHEN r.isResched = 1 AND (r.status = 1 OR r.status = 4) THEN r.status END) AS Reschedule
                FROM reservations r
                WHERE r.branchId = ${branch} AND ( r.date >= '${start}' AND r.date <= '${end}' )
                GROUP BY r.date,r.status
                ORDER BY r.date ASC` 
    let appointmentgraphStatus = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    res.json({data: appointmentgraphStatus })
}

controller.appointment_monthly = async (req,res,next)=>{
    const { startmonth , startyear , endmonth , endyear , branch } = req.body
    let query = `SELECT MONTH(r.date) as monthname,YEAR(r.date) as yearname,
                COUNT(r.status) AS totalcount,
                COUNT(CASE WHEN r.isResched = 0 AND (r.status = 2 OR r.status = 3) THEN r.status END) AS Cancelled,
                COUNT(CASE WHEN r.isResched = 0 AND (r.status = 1 OR r.status = 4) THEN r.status END) AS Approved,
                COUNT(CASE WHEN r.isResched = 1 AND (r.status = 1 OR r.status = 4) THEN r.status END) AS Reschedule
                FROM reservations r
                WHERE r.branchId = ${branch} AND ( MONTH(r.date) >= '${startmonth}' AND YEAR(r.date) >= '${startyear}' )
                AND  ( MONTH(r.date) <= '${endmonth}' AND YEAR(r.date) <= '${endyear}' )
                GROUP BY MONTH(r.date),YEAR(r.date)
                ORDER BY YEAR(r.date) ASC,MONTH(r.date) ASC` 
    let appointmentgraphStatus = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    res.json({data: appointmentgraphStatus })

}

controller.appointment_yearly = async (req,res,next)=>{
    const {  startyear , endyear , branch } = req.body
    let query = `SELECT YEAR(r.date) as yearname,
        COUNT(r.status) AS totalcount,
        COUNT(CASE WHEN r.isResched = 0 AND (r.status = 2 OR r.status = 3) THEN r.status END) AS Cancelled,
        COUNT(CASE WHEN r.isResched = 0 AND (r.status = 1 OR r.status = 4) THEN r.status END) AS Approved,
        COUNT(CASE WHEN r.isResched = 1 AND (r.status = 1 OR r.status = 4) THEN r.status END) AS Reschedule
        FROM reservations r
        WHERE r.branchId = ${branch} AND ( YEAR(r.date) >= '${startyear}' AND YEAR(r.date) <= '${endyear}' )
        GROUP BY YEAR(r.date)
        ORDER BY YEAR(r.date) ASC`

    let appointmentgraphStatus = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    res.json({data: appointmentgraphStatus })


}

module.exports = controller
