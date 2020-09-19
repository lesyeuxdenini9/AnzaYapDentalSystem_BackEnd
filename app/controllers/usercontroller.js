const validator = require('../helper/validator')
const sendemail = require('../helper/sendemail')
const { sequelize, User , Teeth} = require('../models/index')
const UserData = require('../dataaccess/user')
const bcrypt = require('bcrypt')
const formidable = require('formidable')
var fs = require('fs')
const { response } = require('../routes/api')
const saltRounds = 10
const controller = {}

controller.changearchivestatus = (req,res,next)=>{
    const { status , id } = req.body
    let finalstatus = status ? 0 : 1 
    User.update({
        archive: finalstatus,
    },{
        where: {
            id: id
        }
    }).then((response)=>res.json(response))
    .catch(err=>console.log(err))
}

controller.search = (req,res,next)=>{
    const { search , branch , type } = req.body
    UserData.search(search,branch,type).then((response)=>res.json({data: response})).catch(err=>res.status(500).json(err)) 
}

controller.searchPatient = (req,res,next)=>{
       UserData.searchPatient(req.body)
            .then((response)=>{
                res.json({data: response})
            })
            .catch((err)=>res.json(err))

}

controller.addPatient = (req,res,next) =>{
    

    // sendemail("raquem.alvin@gmail.com","Hello world","testing sending of email")


    const rules = {
        "firstname": "required|string",
        "lastname": "required|string",
        "bday": "required|date",
    }

    const { email , fullname , bday , contact , address, middlename, firstname, lastname, gender, history } = req.body
    if(email != "") rules.email =  "required|email|unique:users,email"

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
           res.json(response.err)
        }else{
            // do some generation of text 
        let generatepass
        // if(email != "") {
        //      generatepass = Math.random().toString(36).substring(2,10)
        // }else{
        //      generatepass = "password"
        // }

        generatepass = `${lastname.toLowerCase()}_password`
        
        const newuser = {
            email: email,
            fullname: `${firstname} ${middlename} ${lastname}`,
            firstname: firstname,
            middlename: middlename,
            lastname: lastname,
            password: bcrypt.hashSync(generatepass, saltRounds),
            employeeNo: "",
            bday: bday,
            contact: contact,
            address: address,
            gender: gender,
            history: history,
            usertype: 2,
        }
        const user = await User.create(newuser)
        let teetharr = []
        for(let x = 1 ; x <= 16 ; x++){
            teetharr.push({
                userId: user.id,
                orderNo: parseInt(x),
                flag: 0,
            })
        }

        for(let y = 1 ; y <= 16 ; y++){
            teetharr.push({
                userId: user.id,
                orderNo: parseInt(y),
                flag: 1,
            })
        }

        const userteeth = await Teeth.bulkCreate(teetharr)

        if(email != ""){
           
            const messagehtml = `<div style='height:50px;width:100%;background:#083D55'>
            <span style="font-size:20pt;padding: 30px 0px 0px 10px; font-weight:bold;"><span style="color:#4167D6">Anza</span><span style="color:white">-</span><span style="color:orange;">Yap</span> <small style="color:white">Dental Clinic</small></span>
            </div>
            <h1>Hi ${firstname} ${middlename} ${lastname}</h1>
                <hr/>
                <p>You can now access our portal to view your transactions and appoint reservation in the future</p>
                <p>Email Add: ${email}</p>
                <p>Password: ${generatepass}</p>
                <hr/>
                <p>You can change your password once you login</p>
                <p>Heres our website link: <a href="${process.env.FRONTEND_URL}/">Website link</a></p>
            `
            sendemail(email,"Registration",messagehtml,2)
        }
        res.json(user)
        }
    })
    .catch(err=>console.log(err))
    return

}

controller.saveuser_superadmin = (req,res,next)=>{
    const rules = {
        "email": "required|email|unique:users,email",
        "firstname": "required|string",
        "lastname": "required|string",
        // "password": "required|string|min:6|confirmed|strict",
        "bday": "required|date",

    }
    let finalpassword = ""
    const { email , fullname , employeeNo , bday , contact , address , usertype, password,middlename, firstname, lastname, gender, history } = req.body
    if(usertype == 2){
        rules.password = "required|string|min:6|confirmed|strict"
        finalpassword = password
    }else{
       // rules.employeeNo = "required|string"
        finalpassword = "password"
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
           res.json(response.err)
        }else{
       
        const newuser = {
            email: email,
            fullname: `${firstname} ${middlename} ${lastname}`,
            firstname: firstname,
            middlename: middlename,
            lastname: lastname,
            password: bcrypt.hashSync(finalpassword, saltRounds),
            employeeNo: employeeNo,
            bday: bday,
            contact: contact,
            address: address,
            usertype: usertype,
            gender: gender,
            history: history,
        }
        const user = await User.create(newuser)
        res.json(user)
        }
    })
    .catch(err=>console.log(err))
    return  
}

controller.save = (req,res,next)=>{
    const rules = {
        "email": "required|email|unique:users,email",
        "firstname": "required|string",
        "lastname": "required|string",
        // "password": "required|string|min:6|confirmed|strict",
        "bday": "required|date",

    }

  
    let finalpassword = ""
    const { branch , email , fullname , employeeNo , bday , contact , address , usertype, password,middlename, firstname, lastname, gender, history } = req.body
      if(usertype != 2 && usertype != 3) rules.branch = "required"
    if(usertype == 2){
        rules.password = "required|string|min:6|confirmed|strict"
        finalpassword = password
    }else{
      //  rules.employeeNo = "required|string"
        finalpassword = "password"
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
           res.json(response.err)
        }else{
       
        const newuser = {
            email: email,
            fullname: `${firstname} ${middlename} ${lastname}`,
            firstname: firstname,
            middlename: middlename,
            lastname: lastname,
            password: bcrypt.hashSync(finalpassword, saltRounds),
            employeeNo: employeeNo,
            bday: bday,
            contact: contact,
            address: address,
            usertype: usertype,
            gender: gender,
            history: history,
            branchId: branch
        }
        const user = await User.create(newuser)

        if(usertype == 2){
            let teetharr = []
            for(let x = 1 ; x <= 16 ; x++){
                teetharr.push({
                    userId: user.id,
                    orderNo: parseInt(x),
                    flag: 0,
                })
            }
    
            for(let y = 1 ; y <= 16 ; y++){
                teetharr.push({
                    userId: user.id,
                    orderNo: parseInt(y),
                    flag: 1,
                })
            }
    
            const userteeth = await Teeth.bulkCreate(teetharr)
    
            if(email != ""){
               
                const messagehtml = `<div style='height:50px;width:100%;background:#083D55'>
                <span style="font-size:20pt;padding: 30px 0px 0px 10px; font-weight:bold;"><span style="color:#4167D6">Anza</span><span style="color:white">-</span><span style="color:orange;">Yap</span> <small style="color:white">Dental Clinic</small></span>
                </div>
                <h1>Hi ${firstname} ${middlename} ${lastname}</h1>
                    <hr/>
                    <p>You can now access our portal to view your transactions and appoint reservation in the future</p>
                    <p>Email Add: ${email}</p>
                    <p>Password: ${finalpassword}</p>
                    <hr/>
                    <p>You can change your password once you login</p>
                    <p>Heres our website link: <a href="${process.env.FRONTEND_URL}/">Website link</a></p>
                `
                sendemail(email,"Registration",messagehtml,2)
            }
        }
        res.json(user)
        }
    })
    .catch(err=>console.log(err))
    return
}

controller.changepic = async (req,res,next)=>{
    const userinfo = await req.user
    const userid = userinfo.dataValues.id  

    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files)=> {
        const imagename = files.imgfile ? files.imgfile.name : null
       
        let finalimagename =  imagename == "blob" ? `${userid}_${imagename}_profile.png` : `${userid}_${imagename}`

        if(imagename != null){
            var oldpath = files.imgfile.path
            var newpath = `./public/images/patients`
            if(!fs.existsSync(newpath)){
                fs.mkdirSync(newpath)
            }

            fs.readFile(oldpath,(err,data)=>{
                if(err) throw err
                fs.writeFile(`${newpath}/${finalimagename}`,data,(err)=>{
                    if(err) throw err

                        fs.unlink(oldpath, function (err) {
						    if (err) throw err
						});
                })
            })


        }

        User.update({
            img: finalimagename,
        },{
            where: {
                id: userid
            }
        }).then((response)=>res.json(response))
        .catch(err=>console.log(err))
    })


    
}

controller.changepassEmployee = (req,res,next)=>{
    const idno = req.params.idno
    const rules = {
        "password": "required|string|min:6|confirmed|strict",
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
           res.json(response.err)
        }else{
            const { password } = req.body
            const newpass = {
                password: bcrypt.hashSync(password, saltRounds),
            }

            let updateresult = await User.update(newpass,{where: {id: idno}})
            if(updateresult == 0) res.status(401).json("no record found")  
            res.json(updateresult)
        }
    })
}

controller.changepass = (req,res,next)=>{
    const idno = req.params.idno
    const rules = {
        "oldpass": "required|string",
        "password": "required|string|min:6|confirmed|strict",
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
           res.json(response.err)
        }else{
            
            const { oldpass } = req.body
            const userinfo = await req.user
            const userid = userinfo.dataValues.id            

            const user = await UserData.getUserPass(userid)
            let passwordcheck = await bcrypt.compareSync(oldpass, user.password)
            if(passwordcheck == false){
                res.json({errors: [['Old Password is Incorrect !!']]})
            }else{
                const { password } = req.body
                const newpass = {
                    password: bcrypt.hashSync(password, saltRounds),
                }
    
                let updateresult = await User.update(newpass,{where: {id: userid}})
                if(updateresult == 0) res.status(401).json("no record found")  
                res.json(updateresult)
            }

        
        }
    })
    .catch(err=>console.log(err))
}

controller.getlist = (req,res,next)=>{
    UserData.getAll().then(result=>res.json({data: result})).catch(err=>res.json(err))
}

controller.getUserList = (req,res,next)=>{
    // req.user.then((info)=>console.log(info))
    let usertype = req.params.type
    UserData.getUserAll(usertype).then(result=>res.json({data: result})).catch(err=>res.json(err))
}

controller.getUsersbyArchive = (req,res,next)=>{
    const { type , archive } = req.params
    let archivestatus = archive == "true" ? 0 : 1
    UserData.getUsersbyArchive(type,archivestatus).then(result=>res.json({data: result})).catch(err=>res.json(err))
}

controller.getUser = (req,res,next)=>{
    const user = req.params.user
    UserData.searchUser(user).then(result=>res.json({data: result})).catch(err=>res.json(err))  
}

controller.updateuser_superadmin = (req,res,next)=>{
    const idno = req.params.idno
    const rules = {
        "firstname": "required|string",
        "lastname": "required|string",
        // "employeeNo": "required|string",
        "bday": "required|date",
    }

    const {  email , fullname , oldemail, address, employeeNo, bday, contact, firstname, middlename , lastname, gender, history } = req.body

    if(email != oldemail){
        rules.email = "required|email|unique:users,email"
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
           res.json(response.err)
        }else{            
            const newuser = {
                email: email,
                fullname: `${firstname} ${middlename} ${lastname}`,
                firstname: firstname,
                middlename: middlename,
                lastname: lastname,
                address: address,
                employeeNo: employeeNo,
                bday: bday,
                contact: contact,
                gender: gender,
                history: history
            }

            let updateresult = await User.update(newuser,{where: {id: idno}})
            if(updateresult == 0) res.status(401).json("no record found")    
            let userdata = await UserData.getUser(idno)   
            res.json(userdata)
        }
    })
    .catch(err=>console.log(err))
}

controller.update = (req,res,next)=>{
    const idno = req.params.idno
    const rules = {
        "firstname": "required|string",
        "lastname": "required|string",
        // "employeeNo": "required|string",
        "bday": "required|date",
    }
    

    const { branchId , email , fullname , oldemail, address, employeeNo, bday, contact, firstname, middlename , lastname, gender, history } = req.body

    if(email != oldemail){
        rules.email = "required|email|unique:users,email"
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
           res.json(response.err)
        }else{
            
            const newuser = {
                branchId: branchId,
                email: email,
                fullname: `${firstname} ${middlename} ${lastname}`,
                firstname: firstname,
                middlename: middlename,
                lastname: lastname,
                address: address,
                employeeNo: employeeNo,
                bday: bday,
                contact: contact,
                gender: gender,
                history: history
            }

            let updateresult = await User.update(newuser,{where: {id: idno}})
            if(updateresult == 0) res.status(401).json("no record found")    
            let userdata = await UserData.getUser(idno)   
            res.json(userdata)
        }
    })
    .catch(err=>console.log(err))
}

controller.archive = async (req,res,next)=>{
    const idno = req.params.idno
    let archiveres = await User.update({archive: 1},{where: {id: idno}})
    if(!archiveres)res.status(500).json("something went wrong")
    if(archiveres) res.json("archived")
}

controller.archivebystatus = async (req,res,next)=>{
    const {idno,status} = req.params
    let archiveres = await User.update({archive: status},{where: {id: idno}})
    if(!archiveres)res.status(500).json("something went wrong")
    if(archiveres) res.json("archived")
}

controller.remove = (req,res,next)=>{
    const idno = req.params.idno
    User.destroy({where: {id: idno}}).then(result=>res.json("deleted")).catch(err=>console.log(err))
}

controller.getDetails = async (req,res,next)=>{
    const idno = req.params.idno
    const data = await UserData.getUser(idno)
    res.json({data: data})
}



module.exports = controller
