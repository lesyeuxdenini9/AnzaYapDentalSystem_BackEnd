'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: DataTypes.STRING,
    fullname: DataTypes.STRING,
    password: DataTypes.STRING,
    usertype: DataTypes.INTEGER,
    archive: DataTypes.INTEGER,
    img: DataTypes.STRING,
    bday: DataTypes.DATE,
    address: DataTypes.STRING,
    contact: DataTypes.STRING,
    employeeNo: DataTypes.STRING,
    approvedStatus: DataTypes.INTEGER,
    firstname: DataTypes.STRING,
    middlename: DataTypes.STRING,
    lastname: DataTypes.STRING,
    gender: DataTypes.STRING,
    history: DataTypes.STRING,
    branchId: DataTypes.INTEGER,
    pushnotiftoken: DataTypes.TEXT,
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Refreshtoken)
    User.hasMany(models.Healthcard)
    User.hasMany(models.Transaction)
    User.hasMany(models.Teeth)
    User.hasMany(models.Reservation)
    User.belongsTo(models.Branch)
    User.hasMany(models.Feedback)
    User.hasMany(models.Billing)

      // // scopes should be defined here
      // User.addScope('defaultScope', {
      //   include: [{ model: models.Transaction }],
      // });
      // // scopes with parameter
      // User.addScope('byUser', userId => ({
      //      where: { userId },
      // }));

      //Post.scope('active',{ method: ['byUser', user.id] }).findAll() 
      // or scope(['active',{method: ['byUser',user.id]}]).findAll()

      User.addScope("reservation",{
        include: [
          {
             model: models.Reservation,where: {status:[0,1,4]},required:false,
            include: [{
              model: models.Dentist,where: {archive:0},required:false,
            }],      
          }
        ],
        order: [
          [ { model: models.Reservation }, 'date', 'DESC']
        ], 
      })
  };

  User.loadscope = function(models){
    User.addScope("active",{
      where: {
        archive: 0,
      }
    })

    User.addScope("admin",{
      where: {
        usertype: 0,
      }
    })

    User.addScope("staff",{
      where: {
        usertype: 1,
      }
    })

    User.addScope("patient",{
      where: {
        usertype: 2,
      }
    })

    // User.addScope("reservation",{
    //     include: [
    //       {
    //          model: models.Reservation,where: {status:[0,1,4]},required:false,
    //         include: [{
    //           model: models.Dentist,where: {archive:0},required:false,
    //         }],      
    //       }
    //     ],
    //     order: [
    //       [ { model: models.Reservation }, 'date', 'DESC']
    //     ], 
    // })

    User.addScope("transaction",()=>({
        include: [
          {
            model: models.Transaction, where: {archive:0},required:false,
            include: [{
              model: models.Branch,required:true,
            }],      
          }
        ],
        order: [
          [ { model: models.Transaction }, 'id', 'DESC']
        ], 

    }))
  }
  return User;
};
