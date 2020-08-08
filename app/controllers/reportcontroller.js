const controller = {}
const validator = require('../helper/validator')
const { Billing , Transaction , Dentist , User, sequelize , Billitem} = require('../models/index')
const Sequelize = require('sequelize')
const { STRING } = require('sequelize')
const { response } = require('express')
const op = Sequelize.Op
const literal = Sequelize.literal

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

    query = `SELECT bi.item,bi.description,SUM(bi.qty) as totalcount
            FROM billitems bi
            LEFT JOIN billings b ON b.id = bi.billingId
            WHERE b.branchId = ${branch} AND ( b.date >= '${start}' AND b.date <= '${end}')
            GROUP BY bi.medicineId
            ORDER BY totalcount DESC LIMIT 10`
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

    query = `SELECT bi.item,bi.description,SUM(bi.qty) as totalcount
            FROM billitems bi
            LEFT JOIN billings b ON b.id = bi.billingId
            WHERE b.branchId = ${branch} AND ( MONTH(b.date) >= '${startmonth}' AND YEAR(b.date) >= '${startyear}')
            AND  ( MONTH(b.date) <= '${endmonth}' AND YEAR(b.date) <= '${endyear}')
            GROUP BY bi.medicineId
            ORDER BY totalcount DESC LIMIT 10`

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

    query = `SELECT bi.item,bi.description,SUM(bi.qty) as totalcount
            FROM billitems bi
            LEFT JOIN billings b ON b.id = bi.billingId
            WHERE b.branchId = ${branch} AND ( YEAR(b.date) >= '${startyear}' AND YEAR(b.date) <= '${endyear}')
            GROUP BY bi.medicineId
            ORDER BY totalcount DESC LIMIT 10`

    let servicegraphAvail = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    res.json({graph: salesyearly,serviceMostavail: servicegraphAvail})
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

    query = `SELECT t.serviceId,s.service,COUNT(t.serviceId) as totalcount 
             FROM treatments t 
             LEFT JOIN transactions tr ON t.transactionId = tr.id 
             LEFT JOIN services s ON s.id = t.serviceId 
             WHERE tr.branchId = ${branch} AND ( tr.transactionDate >= '${start}' AND tr.transactionDate <= '${end}')
             GROUP BY t.serviceId
             ORDER BY totalcount DESC LIMIT 5`
    let servicegraphAvail = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    query = `SELECT t.serviceId,s.service,SUM(b.payment) as totalearn 
             FROM treatments t 
             LEFT JOIN transactions tr ON t.transactionId = tr.id 
             LEFT JOIN billings b ON b.transactionId = tr.id
             LEFT JOIN services s ON s.id = t.serviceId 
             WHERE b.branchId = ${branch} AND ( b.date >= '${start}' AND b.date <= '${end}')
             GROUP BY t.serviceId
             ORDER BY totalearn DESC LIMIT 5`

    let servicegrapEarn = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    res.json({graph: salesdaily, serviceMostavail: servicegraphAvail ,serviceMostEarn: servicegrapEarn })
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

    query = `SELECT t.serviceId,s.service,COUNT(t.serviceId) as totalcount 
            FROM treatments t 
            LEFT JOIN transactions tr ON t.transactionId = tr.id 
            LEFT JOIN services s ON s.id = t.serviceId 
            WHERE tr.branchId = ${branch} AND ( MONTH(tr.transactionDate) >= '${startmonth}' AND YEAR(tr.transactionDate) >= '${startyear}')
            AND  ( MONTH(tr.transactionDate) <= '${endmonth}' AND YEAR(tr.transactionDate) <= '${endyear}')
            GROUP BY t.serviceId
            ORDER BY totalcount DESC LIMIT 5`

    let servicegraphAvail = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    res.json({graph: salesmonthly,serviceMostavail: servicegraphAvail})
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

    query = `SELECT t.serviceId,s.service,COUNT(t.serviceId) as totalcount 
            FROM treatments t 
            LEFT JOIN transactions tr ON t.transactionId = tr.id 
            LEFT JOIN services s ON s.id = t.serviceId 
            WHERE tr.branchId = ${branch} AND ( YEAR(tr.transactionDate) >= '${startyear}' AND YEAR(tr.transactionDate) <= '${endyear}')
            GROUP BY t.serviceId
            ORDER BY totalcount DESC LIMIT 5`

    let servicegraphAvail = await sequelize.query(query,{type: sequelize.QueryTypes.SELECT})

    res.json({graph: salesyearly,serviceMostavail: servicegraphAvail})
}

module.exports = controller