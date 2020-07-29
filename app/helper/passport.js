const passport = require('passport')
const passportJWT = require('passport-jwt')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const {sequelize,User} = require('../models/index')

let ExtractJwt = passportJWT.ExtractJwt
let JwtStrategy = passportJWT.Strategy

let jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = process.env.SECRET_KEY

let strategy = new JwtStrategy(jwtOptions, async function(jwt_payload, done) {
// console.log('payload received', jwt_payload)

const user = User.findByPk(jwt_payload.id)
if (user) {
    return done(null, user)
} else {
    return done(null, false)
}
});

passport.serializeUser(function(user, done) {
return done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
await User.findByPk(id,(err,user)=>{
   return done(err, user)
})
});

// use the strategy
passport.use(strategy)

module.exports = passport