
const checkisAuthenticated = async (req,res,next)=>{
    let check = await req.isAuthenticated()
    if(check){
        return next()
    }

    res.json({msg: 'Unauthorized'})
}

const checknotAuthenticated = async (req,res,next)=>{
    let check = await req.isAuthenticated()
    if(check){
        res.end()
        res.redirect('/')   
    }
    
     return next()       
}

const PassportAuthenticate = (passport)=>{
    return passport.authenticate('jwt', { session: false })
}

const getuserinfo = async (req,res,next)=>{
    const user = await req.user
    return user
}


module.exports = {checkisAuthenticated , checknotAuthenticated , PassportAuthenticate , getuserinfo}