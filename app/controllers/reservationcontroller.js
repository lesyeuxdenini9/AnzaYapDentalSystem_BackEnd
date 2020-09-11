const controller = {}
const validator = require('../helper/validator')
const ReservationData = require('../dataaccess/reservation')
const UserData = require('../dataaccess/user')
const sendemail = require('../helper/sendemail')
const sendfirebase = require('../helper/sendfirebase')
const { Reservation,Treatment , Notification, sequelize , Dentist, Branch, Transaction } = require('../models/index')
const { maskzero } = require('../helper/helper')
const { format12Hour, formatHour , formatraw12Hour } = require('../helper/helper')
const { response } = require('express')
var path = require('path')
const dentist = require('../dataaccess/dentist')
const branch = require('../dataaccess/branch')
const Sequelize = require('sequelize')
const op = Sequelize.Op
const literal = Sequelize.literal

controller.create = (req,res,next)=>{
    const rules = {
        type: "required",
        start: "required|string",
        dentist: "required",
        servicelist: "required|array"
    }

    const message = {
        "required.type": "Type is required",
        "required.start": "Start time is required",
        "required.dentist": "Dentist is required",
    }

    const  { branch , type,start,dentist,transaction,servicelist,selectedDate} = req.body
    if(parseInt(type)==1) rules.transaction = "required"
  
    validator(req.body,rules,message).then(async(response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            const userinfo = await req.user
            const userid = userinfo.dataValues.id
            const reservation = {
                branchId: branch,
                date: selectedDate,
                starttime: `${selectedDate} ${start}:00`,
                userId: userid,
                status: 0,
                type: type,
                dentistId: dentist,
                transactionId: transaction,
                Start: `${start}`,
                End: `00:00`,
            }


            sequelize.transaction(async (t) => {

            const saveReservation = await Reservation.create(reservation,{transaction: t})
            const updateReservationNo = await Reservation.update({
                reservationNo: `R${maskzero(11,saveReservation.id)}`
            },{
                where: {
                    id: saveReservation.id
                },
                transaction: t
            })


            let services = servicelist.map((service)=>{
                return {
                    reservationId: saveReservation.id,
                    service: service.service,
                    amount: service.price,
                    serviceId: service.id,
                    actualAmount: service.price
                }
            })

            let insertServices = await Treatment.bulkCreate(services,{transaction: t})

            if(type == 1){
                
                // await Treatment.update({
                //    // transactionId: 0,
                //     serviceId: 0,
                // },{
                //     where: {
                //         transactionId: transaction
                //     },
                //     transaction: t
                // })

                await Treatment.update({
                    transactionId: transaction
                },{
                    where: {
                        reservationId: saveReservation.id
                    },
                    transaction: t
                })
            }


            // if(type == 0){
            //     let services = servicelist.map((service)=>{
            //         return {
            //             reservationId: saveReservation.id,
            //             service: service.service,
            //             amount: service.price,
            //             serviceId: service.id,
            //             actualAmount: service.price
            //         }
            //     })
    
            //     let insertServices = await Treatment.bulkCreate(services,{transaction: t})
            // }else{
            //     let services = await Treatment.update({
            //         reservationId: saveReservation.id
            //     },{
            //         where: {
            //             transactionId: transaction
            //         },
            //         transaction: t
            //     })
       

            // }

            let notificationCreate = await Notification.create({
                branchId: branch,
                isadmin: 1,
                reservationId: saveReservation.id,
                message: `Reservation No: R${maskzero(11,saveReservation.id)} is requesting for approval`,
                targetLink: 'reservation'
            },{transaction: t})

            }).then(result => {
                console.log("Transaction has been committed")    
                res.json({data: "Transaction has been committed"})       
            }).catch(err => {
                console.log(err)
                // console.log("Something went wrong!!")
                res.status(500).json("Something went wrong!!")
            });
        }
    })
}


controller.getReservation = async (req,res,next)=> {
    const userinfo = await req.user
    const branchid = userinfo.branchId
    const { status } = req.params
    ReservationData.getByStatus(status , branchid )
        .then(response=>res.json({data: response}))
        .catch(err=>res.json(err))
}

controller.getReservationPaginate = async (req,res,next)=>{
    const userinfo = await req.user
    const branchid = userinfo.branchId
    const { status } = req.params
    const { page , limit } = req.body
    ReservationData.getReservationPaginate(status , branchid , page , limit )
        .then(response=>res.json({data: response}))
        .catch(err=>res.json(err))
}

controller.reservationInfo = (req,res,next)=>{
    const { idno } = req.params
    ReservationData.reservationInfo(idno)
        .then(response=>res.json({data: response}))
        .catch(err=>res.json(err))
}

controller.deny = async (req,res,next)=>{
    const { idno } = req.params
    const { branchid, branch, remarks , userID, reserveNo ,start, end ,date, dentistname , treatments , patient } = req.body

    let message = `Reservation No: ${reserveNo} request has been denied . ${remarks}`

    let userinfo = await req.user
    let username = userinfo.fullname

    Reservation.update({approvedBy: username,status: 2,},{where: {id: idno}})
        .then(response=> Notification.create({
            isadmin: 0,
            reservationId: idno,
            message: message,
            userId: userID,
            targetLink: 'denied',
            branchId: branchid,
        }))
        .then((response)=>{

            const starttime = start.split(":")
            let st = new Date()
            st.setHours(starttime[0])
            st.setMinutes(starttime[1])
        
            const endtime = end.split(":")
            let et = new Date()
            et.setHours(endtime[0])
            et.setMinutes(endtime[1])
            
            let treatment = ''
            treatments.forEach((treat)=>{
                treatment = `${treatment}<li>${treat.service}</li>`
            })

            const messagehtml = `<div style='height:50px;width:100%;background:#083D55'>
            <span style="font-size:20pt;padding: 30px 0px 0px 10px; font-weight:bold;"><span style="color:#4167D6">Anza</span><span style="color:white">-</span><span style="color:orange;">Yap</span> <small style="color:white">Dental Clinic</small></span>
            </div>
            <h1>Hi ${patient.fullname}</h1>
            <hr/>
            <p>Sorry Your Reservation schedule has been denied.</p>
            <p>Reservation No: ${reserveNo}</p>
            <p>Branch: ${branch}</p>
            <p>Date: ${date}</p>
            <p>Start Time: ${format12Hour(st)}</p>
            <p>End Time: ${format12Hour(et)}</p>
            <p>Dentist: ${dentistname}</p>
            <p style="font-weight:bold">Treatments</p>
            <ul>
                ${treatment}
            </ul>
            <hr/>
            <p>Remarks: Conflict with other schedule. ${remarks}</p>`         
            if(patient.email != "") sendemail(patient.email,"Denied Reservation",messagehtml,2)
            if(patient.pushnotiftoken != "" && patient.pushnotiftoken != null) sendfirebase(patient.pushnotiftoken,"Denied Reservation",`${reserveNo}\n${remarks}`)
            res.json({data: response})
        })
        .catch(err=>res.json(err))
}

controller.cancel = async (req,res,next)=>{
    const { id,reservationNo ,remarks ,User , Treatments ,date ,starttime, endtime ,Dentist , branchId} = req.body
    let message = `Reservation No: ${reservationNo} request has been denied . ${remarks}`
    let userinfo = await req.user
    let username = userinfo.fullname

    Reservation.update({approvedBy: username,status: 3,},{where: {id: id}})
    .then(response=> Notification.create({
        isadmin: 0,
        reservationId: id,
        message: message,
        userId: User.id,
        targetLink: 'cancelled',
        branchId: branchId,
    }))
    .then((response)=>{
        
        let treatment = ''
        Treatments.forEach((treat)=>{
            treatment = `${treatment}<li>${treat.service}</li>`
        })

        const messagehtml = `<div style='height:50px;width:100%;background:#083D55'>
        <span style="font-size:20pt;padding: 30px 0px 0px 10px; font-weight:bold;"><span style="color:#4167D6">Anza</span><span style="color:white">-</span><span style="color:orange;">Yap</span> <small style="color:white">Dental Clinic</small></span>
        </div>
        <h1>Hi ${User.fullname}</h1>
        <hr/>
        <p>Sorry Your Reservation schedule has been cancelled.</p>
        <p>Reservation No: ${reservationNo}</p>
        <p>Branch: </p>
        <p>Date: ${date}</p>
        <p>Start Time: ${format12Hour(starttime)}</p>
        <p>End Time: ${format12Hour(endtime)}</p>
        <p>Dentist: ${Dentist.fullname}</p>
        <p style="font-weight:bold">Treatments</p>
        <ul>
            ${treatment}
        </ul>
        <hr/>
        <p>Remarks: Sorry for the inconvenience. ${remarks}</p>`         
        if(User.email != "") sendemail(User.email,"Cancelled Reservation",messagehtml,2)
        if(User.pushnotiftoken != "" && User.pushnotiftoken != null) sendfirebase(User.pushnotiftoken,"Cancelled Reservation",`${reservationNo}\n${remarks}`)
        res.json({data: response})
    })
    .catch(err=>res.json(err))
}

controller.createWalkInReservation = async (req,res,next)=>{
    const {  dentist, date , start , end , minTime , maxTime ,patient , type , transaction ,branch ,remarks , servicelist} = req.body

    const starttime = start.split(":")
    let st = new Date()
    st.setHours(starttime[0])
    st.setMinutes(starttime[1])

    const endtime = end.split(":")
    let et = new Date()
    et.setHours(endtime[0])
    et.setMinutes(endtime[1])

    const mintime = minTime.split(":")
    let mint = new Date()
    mint.setHours(mintime[0])
    mint.setMinutes(mintime[1])

    const maxtime = maxTime.split(":")
    let maxt = new Date()
    maxt.setHours(maxtime[0])
    maxt.setMinutes(maxtime[1])

    req.body.start = st
    req.body.end = et
    req.body.minTime = mint
    req.body.maxTime = maxt

    const rules = {
        "date": "required|date|after_or_equal:curdate",
        "start": `required|date|after_or_equal:minTime`,
        "end": 'required|date|after:start|before_or_equal:maxTime',
        "patient": 'required',
        "dentist": 'required',
        "servicelist": 'required|array'
    }

    if(parseInt(type)==1) rules.transaction = "required"

    const message = {
        "after_or_equal.start": `The Start time must be equal or after ${format12Hour(req.body.minTime)}`,
        "before_or_equal.end": `The End time must be equal or before ${format12Hour(req.body.maxTime)}`,
    }

    validator(req.body,rules,message).then(async(response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            req.body.start = formatHour(req.body.start)
            req.body.end = formatHour(req.body.end)
            const rules2 = {
                "start": `allowedStartTime:reservations,starttime,${req.body.date},${req.body.dentist}`,
                "end": `allowedEndTime:reservations,endtime,${req.body.date},${req.body.dentist}|allowedMaxEndTime:reservations,endtime,${req.body.date},${req.body.dentist},${req.body.start}`,
            }

            validator(req.body,rules2,{}).then(async (response)=>{
                if(!response.status) {
                    res.send(response.err)
                }else{

                    const userloginfo = await req.user
                    const approvedBy = userloginfo.fullname

                   transactionid = type==1 ? transaction : null

                   
            sequelize.transaction(async (t) => {
                const reservation = {
                    date: date,
                    starttime: `${date} ${start}:00`,
                    endtime: `${date} ${end}:00`,
                    userId: patient,
                    dentistId: dentist,
                    status: 1,
                    type: type,
                    approvedBy: approvedBy,
                    transactionId: transactionid,
                    branchId: branch,
                    remarks: remarks,
                    Start: start,
                    End: end,
                }


                const saveReservation = await Reservation.create(reservation,{transaction: t})
                const updateReservationNo = await Reservation.update({
                    reservationNo: `R${maskzero(11,saveReservation.id)}`
                },{
                    where: {
                        id: saveReservation.id
                    },
                    transaction: t
                })

                let services = servicelist.map((service)=>{
                    return {
                        reservationId: saveReservation.id,
                        service: service.service,
                        amount: service.price,
                        serviceId: service.id,
                        actualAmount: service.price
                    }
                })
    
                let insertServices = await Treatment.bulkCreate(services,{transaction: t})

                if(type == 1){

                    await Treatment.update({
                        transactionId: transaction
                    },{
                        where: {
                            reservationId: saveReservation.id
                        },
                        transaction: t
                    })

                }

    
                // if(type == 0){
                //     let services = servicelist.map((service)=>{
                //         return {
                //             reservationId: saveReservation.id,
                //             service: service.service,
                //             amount: service.price,
                //             actualAmount: service.price,
                //             serviceId: service.id,
                //         }
                //     })
        
                //     let insertServices = await Treatment.bulkCreate(services,{transaction: t})
                // }else{
                //     let services = await Treatment.update({
                //         reservationId: saveReservation.id
                //     },{
                //         where: {
                //             transactionId: transactionid
                //         },
                //         transaction: t
                //     })
                // }
    
                // let notificationCreate = await Notification.create({
                //     branchId: branch,
                //     isadmin: 1,
                //     reservationId: saveReservation.id,
                //     message: `Reservation No: R${maskzero(11,saveReservation.id)} is requesting for approval`,
                //     targetLink: 'reservation'
                // },{transaction: t})
    
                }).then(result => {
                    console.log("Transaction has been committed")    
                    res.json({data: "Transaction has been committed"})       
                }).catch(err => {
                    console.log(err)
                    // console.log("Something went wrong!!")
                    res.status(500).json("Something went wrong!!")
                });
    


                }

            })

        }

    })

}



controller.changeReservationDate = async (req,res,next)=>{
    const { branch, date , start , end , minTime , maxTime , info , dentist , remarks} = req.body
    let userinfo = await req.user
    let approvedBy = userinfo.fullname

    const starttime = start.split(":")
    let st = new Date()
    st.setHours(starttime[0])
    st.setMinutes(starttime[1])

    const endtime = end.split(":")
    let et = new Date()
    et.setHours(endtime[0])
    et.setMinutes(endtime[1])

    const mintime = minTime.split(":")
    let mint = new Date()
    mint.setHours(mintime[0])
    mint.setMinutes(mintime[1])

    const maxtime = maxTime.split(":")
    let maxt = new Date()
    maxt.setHours(maxtime[0])
    maxt.setMinutes(maxtime[1])

    req.body.start = st
    req.body.end = et
    req.body.minTime = mint
    req.body.maxTime = maxt

    const rules = {
        "date": "required|date|after_or_equal:curdate",
        "start": `required|date|after_or_equal:minTime`,
        "end": 'required|date|after:start|before_or_equal:maxTime'
    }

    const message = {
        "after_or_equal.start": `The Start time must be equal or after ${format12Hour(req.body.minTime)}`,
        "before_or_equal.end": `The End time must be equal or before ${format12Hour(req.body.maxTime)}`,
    }


    validator(req.body,rules,message).then(async(response)=>{
        if(!response.status){
            res.json(response.err)
        }else{

            req.body.start = formatHour(req.body.start)
            req.body.end = formatHour(req.body.end)
            // const rules2 = {
            //     "start": `allowedStartTime:reservations,starttime,${req.body.date},${req.body.dentist}`,
            //     "end": `allowedEndTime:reservations,endtime,${req.body.date},${req.body.dentist}|allowedMaxEndTime:reservations,endtime,${req.body.date},${req.body.dentist},${req.body.start}`,
            // }

            const rules2 = {
                "start": `allowedStartTimeCheck:reservations,starttime,${req.body.date},${req.body.dentist},${req.body.refno}`,
                "end": `allowedEndTimeCheck:reservations,endtime,${req.body.date},${req.body.dentist},${req.body.refno}|allowedMaxEndTime:reservations,endtime,${req.body.date},${req.body.dentist},${req.body.start}`,
            }

            validator(req.body,rules2,{}).then(async (response)=>{
                if(!response.status) {
                    res.send(response.err)
                }else{
                    const newstart = `${date} ${start}:00`
                    const newend = `${date} ${end}:00`

                   let reserveUpdate = await Reservation.update({
                                                    starttime: newstart,
                                                    endtime: newend,
                                                    date: date,
                                                    Start: start,
                                                    End: end,
                                                    isResched: 1,
                                                    dentistId: dentist,
                                                },{
                                                    where: {
                                                        id: info.id
                                                    }
                                                })

                        let message = `Reservation No: ${info.reservationNo} Schedule Date has been Changed`
                        let notif = await Notification.create({
                            isadmin: 0,
                            reservationId: info.id,
                            message: message,
                            userId: info.userId,
                            targetLink: 'resched',
                            transactionId: info.transactionId,
                            branchId: info.branchId,
                        })
                        let treatment = ''
                        info.Treatments.forEach((treat)=>{
                            treatment = `${treatment}<li>${treat.service}</li>`
                        })

                        const messagehtml = `<div style='height:50px;width:100%;background:#083D55'>
                            <span style="font-size:20pt;padding: 30px 0px 0px 10px; font-weight:bold;"><span style="color:#4167D6">Anza</span><span style="color:white">-</span><span style="color:orange;">Yap</span> <small style="color:white">Dental Clinic</small></span>
                            </div>
                            <h1>Hi ${info.User.fullname}</h1>
                            <hr/>
                            <p>Your Reservation schedule has been changed.</p>
                            <p>Reservation No: ${info.reservationNo}</p>
                            <p>Branch: ${info.Branch.branch}</p>
                            <p>Old Date: ${info.date}</p>
                            <p>Old Start Time: ${formatraw12Hour(formatHour(info.starttime))}</p>
                            <p>Old End Time: ${formatraw12Hour(formatHour(info.endtime))}</p>
                            <p>New Date: ${date}</p>
                            <p>New Start Time: ${formatraw12Hour(start)}</p>
                            <p>New End Time: ${formatraw12Hour(end)}</p>
                            <p>Dentist: ${info.Dentist.fullname}</p>
                            <p style="font-weight:bold">Treatments</p>
                            <ul>
                                ${treatment}
                            </ul>
                            <hr/>
                            <p>Remarks: ${remarks}</p>`         
                            if(info.User.email != "") sendemail(info.User.email,"Change Reservation Schedule",messagehtml,2)  
                            if(info.User.pushnotiftoken != "" && info.User.pushnotiftoken != null) sendfirebase(info.User.pushnotiftoken,"Change Reservation Schedule",`${info.reservationNo}\n${remarks}`)

                        res.json({data: notif})



                }
            })
        }
    })
}

controller.createFollowupReservation = async (req,res,next)=>{
    
    const { branch, date , start , end , minTime , maxTime , transaction , dentist} = req.body

    let userinfo = await req.user
    let approvedBy = userinfo.fullname

    const starttime = start.split(":")
    let st = new Date()
    st.setHours(starttime[0])
    st.setMinutes(starttime[1])

    const endtime = end.split(":")
    let et = new Date()
    et.setHours(endtime[0])
    et.setMinutes(endtime[1])

    const mintime = minTime.split(":")
    let mint = new Date()
    mint.setHours(mintime[0])
    mint.setMinutes(mintime[1])

    const maxtime = maxTime.split(":")
    let maxt = new Date()
    maxt.setHours(maxtime[0])
    maxt.setMinutes(maxtime[1])

    req.body.start = st
    req.body.end = et
    req.body.minTime = mint
    req.body.maxTime = maxt

    const rules = {
        "date": "required|date|after:curdate",
        "start": `required|date|after_or_equal:minTime`,
        "end": 'required|date|after:start|before_or_equal:maxTime'
    }

    const message = {
        "after_or_equal.start": `The Start time must be equal or after ${format12Hour(req.body.minTime)}`,
        "before_or_equal.end": `The End time must be equal or before ${format12Hour(req.body.maxTime)}`,
    }


    validator(req.body,rules,message).then(async(response)=>{
        if(!response.status){
            res.json(response.err)
        }else{
            req.body.start = formatHour(req.body.start)
            req.body.end = formatHour(req.body.end)
            const rules2 = {
                "start": `allowedStartTime:reservations,starttime,${req.body.date},${req.body.dentist}`,
                "end": `allowedEndTime:reservations,endtime,${req.body.date},${req.body.dentist}|allowedMaxEndTime:reservations,endtime,${req.body.date},${req.body.dentist},${req.body.start}`,
            }

            validator(req.body,rules2,{}).then(async (response)=>{
                if(!response.status) {
                    res.send(response.err)
                }else{
                    Reservation.create({
                        branchId: branch,
                        date: date,
                        starttime: `${date} ${start}:00`,
                        endtime: `${date} ${end}:00`,
                        userId: parseInt(transaction.userId),
                        dentistId: dentist,
                        status: 1,
                        type: 1,
                        approvedBy: approvedBy,
                        transactionId: transaction.id,
                        Start: start,
                        End: end
                    })  
                    .then(async (response)=> {
                        await Reservation.update({
                            reservationNo: `R${maskzero(11,response.id)}`
                        },{
                            where: {
                                id: response.id
                            }
                        })
                        return response
                    })
                    .then(async (response)=>{
                        let message = `Reservation No: R${maskzero(11,response.id)} request has been approved`
                        let notif = await Notification.create({
                            isadmin: 0,
                            reservationId: response.id,
                            message: message,
                            userId: response.userId,
                            targetLink: 'approved',
                            transactionId: response.transactionId,
                            branchId: response.branchId,
                        })

                        return response
                    })
                    .then(async (response)=>{
                
                        let treatment = ''
                        let treatments = []
                        transaction.Treatments.forEach((treat)=>{
                            treatment = `${treatment}<li>${treat.service}</li>`
                            treatments.push({
                                transactionId: transaction.id,
                                service: treat.service,
                                amount: treat.amount,
                                reservationId: response.id,
                                serviceId: treat.serviceId,
                                actualAmount: treat.actualAmount,
                            })
                        })

                        let insertServices = await Treatment.bulkCreate(treatments)


                        const messagehtml = `<div style='height:50px;width:100%;background:#083D55'>
                        <span style="font-size:20pt;padding: 30px 0px 0px 10px; font-weight:bold;"><span style="color:#4167D6">Anza</span><span style="color:white">-</span><span style="color:orange;">Yap</span> <small style="color:white">Dental Clinic</small></span>
                        </div>
                        <h1>Hi ${transaction.User.fullname}</h1>
                            <hr/>
                            <p>Your Reservation schedule has been confirmed.</p>
                            <p>Reservation No: R${maskzero(11,response.id)}</p>
                            <p>Branch: </p>
                            <p>Date: ${date}</p>
                            <p>Start Time: ${format12Hour(st)}</p>
                            <p>End Time: ${format12Hour(et)}</p>
                            <p>Dentist: ${transaction.dentist}</p>
                            <p style="font-weight:bold">Treatments</p>
                            <ul>
                                ${treatment}
                            </ul>
                            <p>Remarks:</p>
                            <hr/>
                            <p>Please arrive on or before your schedule.</p>
                            <p>Note: Failure to show after 15 minutes on scheduled time will cancel your reservation slot.</p>
                        `
    
                            if(transaction.User.email != "") sendemail(transaction.User.email,"Approved Reservation",messagehtml,2)
                            if(transaction.User.pushnotiftoken != "" && transaction.User.pushnotiftoken != null) sendfirebase(transaction.User.pushnotiftoken,"Approved Reservation",`R${maskzero(11,response.id)}`)
                        res.json({data: response})
                    })
                    .catch(err=>res.json(err))
                }
            })
        }
    })


}

controller.confirm = (req,res,next)=>{
    const { idno } = req.params
    const {branchid, branch, minTime, maxTime, remarks , userID, reserveNo, start, end ,date ,dentist ,dentistname , treatments , patient } = req.body
    
    const starttime = start.split(":")
    let st = new Date()
    st.setHours(starttime[0])
    st.setMinutes(starttime[1])

    const endtime = end.split(":")
    let et = new Date()
    et.setHours(endtime[0])
    et.setMinutes(endtime[1])

    const mintime = minTime.split(":")
    let mint = new Date()
    mint.setHours(mintime[0])
    mint.setMinutes(mintime[1])

    const maxtime = maxTime.split(":")
    let maxt = new Date()
    maxt.setHours(maxtime[0])
    maxt.setMinutes(maxtime[1])

    req.body.start = st
    req.body.end = et
    req.body.minTime = mint
    req.body.maxTime = maxt

    const rules = {
        "start": `required|date|after_or_equal:minTime`,
        "end": 'required|date|after:start|before_or_equal:maxTime',
    }
    const message = {
        "after_or_equal.start": `The Start time must be equal or after ${format12Hour(req.body.minTime)}`,
        "before_or_equal.end": `The End time must be equal or before ${format12Hour(req.body.maxTime)}`,
    }

    validator(req.body,rules,message).then((response)=>{
        if(!response.status) {
            res.send(response.err)
        }else{
            req.body.start = start
            req.body.end = end
            const rules2 = {
                "start": `allowedStartTime:reservations,starttime,${date},${dentist}`,
                "end": `allowedEndTime:reservations,endtime,${date},${dentist}|allowedMaxEndTime:reservations,endtime,${date},${dentist},${start}`,
            }

            validator(req.body,rules2,{}).then(async (response)=>{
                if(!response.status) {
                    res.send(response.err)
                }else{
                        let userinfo = await req.user
                        let username = userinfo.fullname
                        let message = `Reservation No: ${reserveNo} request has been approved . ${remarks}`
                        Reservation.update({approvedBy: username,dentistId:dentist,status: 1,starttime: `${date} ${start}:00`, endtime: `${date} ${end}:00`,Start: start, End: end},{where: {id: idno}})
                        .then(response=> Notification.create({
                            isadmin: 0,
                            reservationId: idno,
                            message: message,
                            userId: userID,
                            targetLink: 'approved',
                            branchId: branchid,
                        }))
                        .then((response)=>{
                            let treatment = ''
                            treatments.forEach((treat)=>{
                                treatment = `${treatment}<li>${treat.service}</li>`
                            })
                            const messagehtml = `<div style='height:50px;width:100%;background:#083D55'>
                            <span style="font-size:20pt;padding: 30px 0px 0px 10px; font-weight:bold;"><span style="color:#4167D6">Anza</span><span style="color:white">-</span><span style="color:orange;">Yap</span> <small style="color:white">Dental Clinic</small></span>
                            </div>
                            <h1>Hi ${patient.fullname}</h1>
                            <hr/>
                            <p>Your Reservation schedule has been confirmed.</p>
                            <p>Reservation No: ${reserveNo}</p>
                            <p>Branch: ${branch}</p>
                            <p>Date: ${date}</p>
                            <p>Start Time: ${format12Hour(st)}</p>
                            <p>End Time: ${format12Hour(et)}</p>
                            <p>Dentist: ${dentistname}</p>
                            <p style="font-weight:bold">Treatments</p>
                            <ul>
                                ${treatment}
                            </ul>
                            <p>Remarks: ${remarks}</p>
                            <hr/>
                            <p>Please arrive on or before your schedule Time.</p>
                            <p>Note: Failure to show after 15 minutes on scheduled time will cancel your reservation slot.</p>
                        `
    
                            if(patient.email != "") sendemail(patient.email,"Approved Reservation",messagehtml,2)
                            if(patient.pushnotiftoken != "" && patient.pushnotiftoken != null) sendfirebase(patient.pushnotiftoken,"Approved Reservation",`${reserveNo}\n${remarks}`)
                            res.json({data: response})
                        })
                        .catch(err=>res.json(err))

                }
            })

        }

    })
}

controller.proceedTransaction = async (req,res,next)=>{
    const { TransactionId , id ,type , date , Dentist , DentistId , userId , branchId, Start , End} = req.body
   
    sequelize.transaction(async (t) => {

        const userinfo = await req.user
        const createdby = userinfo.dataValues.fullname
        const modifiedby = createdby
 
        let updateclause = {
            status: 4
        }
     
        if(type == 0){

            const saveTransaction = await Transaction.create({
                transactionDate: date,
                dentist: Dentist.fullname,
                dentistId: DentistId,
                userId: userId,
                reservationId: id,
                createdBy: createdby,
                modifiedBy: modifiedby,
                branchId: branchId,
                Start: Start,
                End: End
            },{transaction: t})

            const updatetransaction = await Transaction.update({
                transactionNo: `T${maskzero(11,saveTransaction.id)}`
            },{
                where: {
                    id: saveTransaction.id
                },
                transaction: t
            })

            const updateTreatments = await Treatment.update({
                transactionId: saveTransaction.id,
                default_: 1,
            },{
                where: {
                    reservationId: id
                },
                transaction: t
            })
            updateclause.transactionId = saveTransaction.id
        }else{
            const updatetransaction = await Transaction.update({
                status: 0,
                Start: Start,
                End: End,
                modifiedby: modifiedby,
            },{
                where: {
                    id: TransactionId,
                    // reservationId: id,
                },
                transaction: t
            })
        }

        const updateReservation = await Reservation.update(
           updateclause
        ,{
            where: {
                id: id
            },
            transaction: t
        })


        }).then(result => {
            console.log("Transaction has been committed")    
            res.json({data: "Transaction has been committed"})       
        }).catch(err => {
            console.log(err)
            // console.log("Something went wrong!!")
            res.status(500).json("Something went wrong!!")
        });
}


controller.changeTimeReservation = async (req,res,next)=>{
    const events = req.body
    // const userinfo = await req.user
    // const username = userinfo.fullname

    let socketUserid = []
    events.forEach(async (event)=>{
        let eventinfo = await ReservationData.reservationInfo(event.id)
        let updateinfo = await Reservation.update({
            starttime: event.start,
            endtime: event.end,
            Start: formatHour(event.start),
            End: formatHour(event.end),
            isResched: 1,
        },{
            where: {
                id: event.id
            }
        })

        let notifcreate = Notification.create({
            userId: eventinfo.User.id,
            isadmin: 0,
            reservationId: eventinfo.id,
            message: `Reservation No: ${eventinfo.reservationNo} 
            Schedule Time has been changed from ${formatraw12Hour(formatHour(eventinfo.starttime))} - ${formatraw12Hour(formatHour(eventinfo.endtime))}
            to ${formatraw12Hour(formatHour(event.start))} - ${formatraw12Hour(formatHour(event.end))}`,
            targetLink: "message",
            isAnnounce: 1,
            branchId: eventinfo.branchId,
        })

        let treatment = ''
        eventinfo.Treatments.forEach((treat)=>{
            treatment = `${treatment}<li>${treat.service}</li>`
        })
        // const rootpath = path.dirname(require.main.filename || process.mainModule.filename)
        // const imagepath = path.join(rootpath,'public/images/dentallogo.png')
        // console.log(imagepath)
        const messagehtml = `<div style='height:50px;width:100%;background:#083D55'>
        <span style="font-size:20pt;padding: 30px 0px 0px 10px; font-weight:bold;"><span style="color:#4167D6">Anza</span><span style="color:white">-</span><span style="color:orange;">Yap</span> <small style="color:white">Dental Clinic</small></span>
        </div>
        <h1>Hi ${eventinfo.User.fullname}</h1>
        <hr/>
        <p>Your Reservation schedule Time has been changed.</p>
        <p>Reservation No: ${eventinfo.reservationNo}</p>
        <p>Branch: ${eventinfo.Branch.branch}</p>
        <p>Date: ${eventinfo.date}</p>
        <p>Old Start Time: ${formatraw12Hour(formatHour(eventinfo.starttime))}</p>
        <p>Old End Time: ${formatraw12Hour(formatHour(eventinfo.endtime))}</p>
        <p>New Start Time: ${formatraw12Hour(formatHour(event.start))}</p>
        <p>New End Time: ${formatraw12Hour(formatHour(event.end))}</p>
        <p>Dentist: ${eventinfo.Dentist.fullname}</p>
        <p style="font-weight:bold">Treatments</p>
        <ul>
            ${treatment}
        </ul>
        <hr/>
        <p>Remarks:</p>`         
        if(eventinfo.User.email != "") sendemail(eventinfo.User.email,"Change Reservation Time",messagehtml,2)
        if(eventinfo.User.pushnotiftoken != "" && eventinfo.User.pushnotiftoken != null) sendfirebase(eventinfo.User.pushnotiftoken,"Change Reservation Time",`${eventinfo.reservationNo}`)
        socketUserid.push(eventinfo.User.id)
        
    })

    res.json({data: socketUserid})
}

controller.getPatientReservations = async (req,res,next)=>{
    const { start , end , branchid , reservation} = req.body
    let userinfo = await req.user
    let userid = userinfo.id
    ReservationData.getPatientReservations(start,end,userid ,branchid, reservation)
        .then(response=>res.json({data: response}))
        .catch(err=>res.json(err))
}

controller.getActiveListDay = (req,res,next)=>{
    const { date, dentist ,branch } = req.params
    ReservationData.getActiveListDay(date,dentist, branch )
        .then(response=>res.json({data: response}))
        .catch(err=>res.json(err))
}

controller.getApprovedTimeDay = (req,res,next)=>{
    const { dentist , date } = req.body
    ReservationData.getApprovedTimeDay(dentist,date)
        .then(response=>res.json({data: response}))
        .catch(err=>res.json(err))
}

controller.appointments = (req,res,next)=>{
    const { start , end , branch , dentist } = req.body
    ReservationData.appointments(start,end,branch ,dentist)
        .then(response=>res.json({data: response}))
        .catch(err=>res.json(err))
}

controller.getReservationFollowup = (req,res,next)=>{
    const { idno } = req.params

    ReservationData.getReservationFollowup(idno)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.json(err))
}

controller.deleteReservation = (req,res,next)=>{
    const { idno } = req.params
    Reservation.destroy({
        where: {
            id: idno
        }
    })
    .then((response)=>Treatment.destroy({
        where: {
            reservationId: idno,
        }
    }))
    .then((response)=>res.json({data: response}))
    .catch(err=>res.json(err))
}

controller.list = (req,res,next) => {
    const {start , end , reservationNo , branch , dentist , status } = req.body
    ReservationData.list(start,end,reservationNo,branch, dentist , status)
        .then((response)=>res.json({data: response}))
        .catch(err=>res.json(err))
}

controller.getNextAppointment = async (req,res,next)=>{
    const userinfo = await req.user


    let expired = await Reservation.count({
        where: {
            userId: userinfo.id,
            date: {
                [op.lt]: literal("DATE(NOW())")
            },
            status: {
                [op.lt]: 2
            }
        }
    })

    if(expired > 0) await Reservation.update({
        status: 3
    },{
        where: {
            userId: userinfo.id,
            date: {
                [op.lt]: literal("DATE(NOW())")
            },
            status: {
                [op.lt]: 2
            }
        }
    })

     let nextappointment = await Reservation.findAll({
        include: [{
            model: Dentist,
            required: true,
            attributes: ['fullname'],
        },{
            model: Branch,
            required: true,
            attributes: ['branch']
        }],
        where: {
            userId: userinfo.id,
            status: {
                [op.or]: [0,1]
            },
            date: {
                [op.gte]:  literal("DATE(NOW())")
            }
        }
    })
     
    res.json({data: nextappointment})

}




module.exports = controller
