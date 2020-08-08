var nodemailer = require('nodemailer');


const sendemail = function(email,subject,message,type = 1,callback){
    // var transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //       user: 'anzayapThesisDental@gmail.com',
    //       pass: '7Ujm6Yhn)(*'
    //     }
    //   });
      
      let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
       // service: 'gmail',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.SENDEMAIL_USER,
            pass: process.env.SENDEMAIL_PASS
        }
    });
      
      var mailOptions = {
        from: process.env.SENDEMAIL_USER,
        to: email,
        subject: subject,    
      };
      
      if(type==1) mailOptions.text =  message
      if(type==2) mailOptions.html = message
   
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          callback(0)
        } else {
          console.log('Email sent: ' + info.response);
          callback(1)
        }
      });


}

module.exports = sendemail

