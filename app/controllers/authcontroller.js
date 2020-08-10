const validator = require('../helper/validator')
const bcrypt = require('bcrypt')
const saltRounds = 10
const { generate_token } = require('../helper/helper')
const sendemail = require('../helper/sendemail')
const jwt = require('jsonwebtoken')
const { sequelize, User , Refreshtoken , Resettoken } = require('../models/index')
const RefreshtokenData = require('../dataaccess/refreshtoken')
const Sequelize = require('sequelize')
const op = Sequelize.Op
const controller = {}



controller.login = async (req,res,next)=>{
    const rules = {
        "email": "required|email",
        "password": "required|string|min:6",
    }

    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
           res.send(response.err)
        }else{
        const { email , password , loginsource} = req.body
        try {
 
            let user = loginsource == 'web' ? await User.scope("active").findOne({where: {email: email}}) : await User.scope("active").findOne({where: {usertype: 2, email: email}})
            if(!user){
                res.status(401).json({msg: 'No user found'})
                // res.json({error: 'No user found'})
            }
    
            let passwordcheck = await bcrypt.compareSync(password, user.password)
            if(passwordcheck){
                const payload = { id: user.id }
                const token = jwt.sign(payload, process.env.SECRET_KEY,{expiresIn: '12h'})
                const refreshtoken = jwt.sign(payload,process.env.REFRESH_SECRET_KEY)
                // const refreshtoken = jwt.sign(payload,process.env.REFRESH_SECRET_KEY,{expiresIn: '2d'}) // refresh token is longer than access token
                RefreshtokenData.saveRefreshToken(refreshtoken,user.id)
                res.json({accesstoken: token,refreshtoken: refreshtoken,user: {id: user.id,fullname: user.fullname,usertype: user.usertype,email: user.email,img: user.img}})
            }else {
                res.status(401).json({ msg: 'Password is incorrect' })
               // res.json({error: 'Password is Incorrect'})
            }
        }catch(err){
            res.status(500).json(err)
        }
    
       
        }
    })
    .catch(err=>console.log(err))
    return
}

controller.refreshtoken = async (req,res,next)=>{
   
    const { refreshtoken } = req.body
    if (refreshtoken == null) return res.status(401).json({msg: "Refresh token is required"})
    const findtoken = await RefreshtokenData.getRefreshtoken(refreshtoken)
    if(!findtoken) return res.status(403).json({msg: "No token Found"})

    jwt.verify(refreshtoken,process.env.REFRESH_SECRET_KEY,async (err,user)=>{

		if(err) res.sendStatus(403)

			// res.json(user.id)
			let payload = { id: user.id }

            const newtoken = jwt.sign(payload, process.env.SECRET_KEY,{expiresIn: '12h'})
            const newrefreshtoken = jwt.sign(payload,process.env.REFRESH_SECRET_KEY)
            // const newrefreshtoken = jwt.sign(payload,process.env.REFRESH_SECRET_KEY,{expiresIn: '2d'}) // refresh token is longer than access token
            RefreshtokenData.saveRefreshToken(newrefreshtoken,user.id)
            RefreshtokenData.revoke(refreshtoken)
            // RefreshtokenData.remove(refreshtoken)
            const userinfo = await User.findByPk(user.id)
			res.json({accesstoken: newtoken,refreshtoken: newrefreshtoken,user: {id: userinfo.id,fullname: userinfo.fullname,usertype: userinfo.usertype,email: userinfo.email,img: userinfo.img}})
    })
    
}

controller.logout = async (req,res,next) => {
    const user = await req.user
    Refreshtoken.destroy({where: {userId: user.id}}).then(result=>res.json(`refresh tokens are deleted`)).catch(err=>console.log(err))
}


controller.changepass = (req,res,next)=>{
    const rules = {
         "password": "required|string|min:6|confirmed|strict",
    }

    validator(req.body,rules,{}).then(async(response)=>{
        if(!response.status){
            res.send(response.err)
         }else{
            const { password , token } = req.body
            console.log(password)
            console.log(token)
            const usertokencheck = await Resettoken.findOne({
                where: {
                    token: token
                }
            })

            const updatepass = await User.update({
                password: bcrypt.hashSync(password, saltRounds),
            },{
                where: {
                    id: usertokencheck.userId,
                }
            })

            const removealltoken = await Resettoken.destroy({
                where: {
                    userId: usertokencheck.userId,
                }
            })

            res.json({data: "successful"})

         }
    })
}

controller.sendResetLink = (req,res,next)=>{
    const rules = {
        "email": "required|email"
    }

    
    validator(req.body,rules,{}).then(async (response)=>{
        if(!response.status){
           res.send(response.err)
        }else{
            const { email } = req.body
            const user = await User.findOne({
                where: {
                    email: email
                }
            })

            if(user){
                const tokensave = await Resettoken.create({
                    userId: user.id,
                    email: user.email,
                    token: `${generate_token(100)}${user.id}`,
                })
     
                const messagehtml = `<div style='height:50px;width:100%;background:#083D55'>
                <span style="font-size:20pt;padding: 30px 0px 0px 10px; font-weight:bold;"><span style="color:#4167D6">Anza</span><span style="color:white">-</span><span style="color:orange;">Yap</span> <small style="color:white">Dental Clinic</small></span>
                </div>
                <h1>Hi ${user.firstname} ${user.middlename} ${user.lastname}</h1>
                     <hr/>
                     <p>You can now Change your password by clicking this link</p>
                     <p>link: <a href="${process.env.FRONTEND_URL}/setpassword/${tokensave.token}">Reset link</a></p>
                 `
                sendemail(email,"Reset Password",messagehtml,2,(response)=>{
                    console.log(response)
                    if(response == 1){
                        res.json({type: "success", msg: "Check Reset link in your email"})
                    }else{
                        res.json({type: "error", msg: "Something went wrong!"})
                    }
                })
               
     
            }else{
                res.json({type: "warning",msg: "No User Found"})
            }

       
        }

    })

    
}

controller.pushnotiftoken = (req,res,next)=>{
    const { email , token } = req.body
    console.log(email)
    console.log(token)

    User.update({pushnotiftoken: ''},{
        where: {
            email: {
                [op.ne]: email
            },
            usertype: 2,
            pushnotiftoken: token
        }
    }).then(response=> User.update({
        pushnotiftoken: token
    },{
        where: {
            email: email
        }
    })).then(response=>res.json({data: response}))
    .catch(err=>res.status(500).json(err))
}


module.exports = controller
