
var admin = require("firebase-admin");
var serviceAccount = require("../../dentalthesis-2c6cb-firebase-adminsdk-1vkjn-547b2ad07f.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://dentalthesis-2c6cb.firebaseio.com"
});


const sendfirebase = (token,title,body)=>{
    let payload = {
        notification: {
            title: title,
            body: body
        },
        data: {

        },
    }

    let options = {
        priority: 'high',
        timeToLive: 60*60*24,
    }

    admin.messaging().sendToDevice(token,payload,options).then((res)=>{
        console.log("successful",res)
    }).catch((err)=>{
        console.log(err)
    })
}


module.exports = sendfirebase