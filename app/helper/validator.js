const Validator = require('validatorjs')
const { User,Dentist,Reservation } = require('../models/index')
const Sequelize = require('sequelize')
const op = Sequelize.Op
const literal = Sequelize.literal
const col = Sequelize.col
const fn = Sequelize.fn
const { formatHour } = require('./helper')

const validator = (body, rules, customMessages) => {
    return new Promise((resolve,reject)=>{
        try {
            const validation = new Validator(body, rules, customMessages);
            validation.passes(() => resolve({err: null, status: true}));
            validation.fails(() => resolve({err: validation.errors, status: false}));
        }catch(err){
            reject(err)
        }
      
    })
};

// custom validation 
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)./
// Tighten password policy
                    // customname  ,    condition     ,        custommessage
Validator.register('strict', value => passwordRegex.test(value),'password must contain at least one uppercase letter, one lowercase letter and one number');

// // check duplication of column

Validator.registerAsync('unique', async (value,  attribute, req , passes) => {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: unique:table,column');
    //split table and column
    let attArr = attribute.split(",");
    if (attArr.length !== 2) throw new Error(`Invalid format for validation rule on ${attribute}`);
    //assign array index 0 and 1 to table and column respectively
    const { 0: table, 1: column } = attArr;
    //define custom error message
    let msg = (column == "email") ? `${column} has already been taken `: `${column} already in use`

    //check if incoming value already exists in the database
    // query logic here
    let user = await User.count({where: {email: value}})
    if(user>=1){
        // means there is already registered email in DB
        passes(false, msg)
    }else{
        passes(true)
        return
    }

    

});


Validator.registerAsync('uniqueDentist', async (value,  attribute, req , passes) => {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: unique:table,column');
    //split table and column
    let attArr = attribute.split(",");
    if (attArr.length !== 2) throw new Error(`Invalid format for validation rule on ${attribute}`);
    //assign array index 0 and 1 to table and column respectively
    const { 0: table, 1: column } = attArr;
    //define custom error message
    let msg = (column == "email") ? `${column} has already been taken `: `${column} already in use`

    //check if incoming value already exists in the database
    // query logic here
    let user = await Dentist.count({where: {email: value}})
    if(user>=1){
        // means there is already registered email in DB
        passes(false, msg)
    }else{
        passes(true)
        return
    }

    

});


Validator.registerAsync('allowedStartTimeCheck', async (value,  attribute, req , passes) => {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: allowedStartTime:table,column,date,dentist');
    let attArr = attribute.split(",");
    if (attArr.length !== 5) throw new Error(`Invalid format for validation rule on ${attribute}`);
    const { 0: table, 1: column , 2: date, 3: dentist , 4: refno} = attArr;
    let msg = (column == "starttime") ? `${column} is conflict with other schedule `: `${column} already in use`

    let checkreservation = await Reservation.count({where: literal(`('${value}:00' BETWEEN TIME(starttime) AND TIME(endtime)) AND (status = 1 OR status = 4) AND id != '${refno}' AND date = '${date}' AND dentistID = ${parseInt(dentist)}`)})
    if(checkreservation>=1){
        passes(false, msg)
    }else{
        passes(true)
        return
    }
});


Validator.registerAsync('allowedEndTimeCheck', async (value,  attribute, req , passes) => {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: allowedEndTime:table,column,date,dentist');
    let attArr = attribute.split(",");
    if (attArr.length !== 5) throw new Error(`Invalid format for validation rule on ${attribute}`);
    const { 0: table, 1: column , 2: date, 3: dentist , 4: refno} = attArr;
    let msg = (column == "endtime") ? `${column} is conflict with other schedule `: `${column} already in use`

    let checkreservation = await Reservation.count({where: literal(`('${value}:00' BETWEEN TIME(starttime) AND TIME(endtime)) AND (status = 1 OR status = 4) AND id != '${refno}' AND date = '${date}' AND dentistID = ${parseInt(dentist)}`)})
    if(checkreservation>=1){
        passes(false, msg)
    }else{
        passes(true)
        return
    }
});




Validator.registerAsync('allowedStartTime', async (value,  attribute, req , passes) => {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: allowedStartTime:table,column,date,dentist');
    let attArr = attribute.split(",");
    if (attArr.length !== 4) throw new Error(`Invalid format for validation rule on ${attribute}`);
    const { 0: table, 1: column , 2: date, 3: dentist } = attArr;
    let msg = (column == "starttime") ? `${column} is conflict with other schedule `: `${column} already in use`

    let checkreservation = await Reservation.count({where: literal(`('${value}:00' BETWEEN TIME(starttime) AND TIME(endtime)) AND (status = 1 OR status = 4) AND date = '${date}' AND dentistID = ${parseInt(dentist)}`)})
    if(checkreservation>=1){
        passes(false, msg)
    }else{
        passes(true)
        return
    }
});


Validator.registerAsync('allowedEndTime', async (value,  attribute, req , passes) => {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: allowedEndTime:table,column,date,dentist');
    let attArr = attribute.split(",");
    if (attArr.length !== 4) throw new Error(`Invalid format for validation rule on ${attribute}`);
    const { 0: table, 1: column , 2: date, 3: dentist } = attArr;
    let msg = (column == "endtime") ? `${column} is conflict with other schedule `: `${column} already in use`

    let checkreservation = await Reservation.count({where: literal(`('${value}:00' BETWEEN TIME(starttime) AND TIME(endtime)) AND (status = 1 OR status = 4) AND date = '${date}' AND dentistID = ${parseInt(dentist)}`)})
    if(checkreservation>=1){
        passes(false, msg)
    }else{
        passes(true)
        return
    }
});


Validator.registerAsync('allowedMaxEndTime', async (value,  attribute, req , passes) => {
    if (!attribute) throw new Error('Specify Requirements i.e fieldName: allowedMaxEndTime:table,column,date,dentist,start');
    let attArr = attribute.split(",");
    if (attArr.length !== 5) throw new Error(`Invalid format for validation rule on ${attribute}`);
    const { 0: table, 1: column , 2: date, 3: dentist, 4: start } = attArr;
    let msg = (column == "endtime") ? `${column} is conflict with other schedule `: `${column} already in use`

    let checkreservation = await Reservation.findOne({
        attributes: [
            [fn('MAX',col('endtime')),'lastEndTime'],
            [fn('MAX',col('starttime')),'startMaxTime'],
        ],
        where: {
            status: {
                [op.or]: [1,4]
            },  
            date: date,
            dentistId: dentist,
        }
    })


    let lastEndTime = checkreservation.dataValues.lastEndTime
    let valuetime = new Date(`${date} ${value}:00`)

    let startMaxTime = checkreservation.dataValues.startMaxTime
    let starttime = new Date(`${date} ${start}:00`)
    if(valuetime >lastEndTime && starttime < startMaxTime) {
        passes(false, msg)
    }else{
        passes(true)
        return
    }
});


module.exports = validator  