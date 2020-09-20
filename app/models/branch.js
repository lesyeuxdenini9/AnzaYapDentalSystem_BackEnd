'use strict';
module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
    branch: DataTypes.STRING,
    address: DataTypes.STRING,
    contact: DataTypes.STRING,
    email: DataTypes.STRING,
    longitude: DataTypes.FLOAT,
    latitude: DataTypes.FLOAT,
    archive: DataTypes.INTEGER,
    tin: DataTypes.STRING,
    vat: DataTypes.INTEGER,
  }, {});
  Branch.associate = function(models) {
    // associations can be defined here
    Branch.hasMany(models.Schedule)
    Branch.hasMany(models.User)
    Branch.hasMany(models.Service)
    Branch.hasMany(models.Dentist)
    Branch.hasMany(models.Medicine)
    Branch.hasMany(models.Reservation)
    Branch.hasMany(models.Transaction)
    Branch.hasMany(models.Notification)
    Branch.hasMany(models.Billing)
  };

  Branch.loadscope = function(models){
    Branch.addScope("active",{
      where: {
        archive: 0,
      }
    })

    Branch.addScope("schedules",{
        include: [{
            model: models.Schedule,
            required: true,
        }]
    })

    Branch.addScope("users",(type)=>({
        include: [{
            model: models.User.scope("active"),
            attributes: {excludes: ["password"]},
            where: {
              usertype: type
            },  
            required: false,
        }],
    }))

    Branch.addScope("usersbyarchive",(data)=>({
      include: [{
          model: models.User,
          attributes: {excludes: ["password"]},
          where: {
            usertype: data[0],
            archive: data[1]
          },  
          required: false,
      }],
  }))

    Branch.addScope("medicines",(type)=>({
      include: [{
          model: models.Medicine.scope("active"),
          where: {
            type: type
          },  
          required: false,
      }],
  }))

  Branch.addScope("medicinesbyarchive",(data)=>({
        include: [{
          model: models.Medicine,
          where: {
            type: data.type,
            archive: data.archive
          },  
          required: false,
      }],
  }))


    Branch.addScope("services",{
      include: [{
        model: models.Service,
        where: {archive:0},
        required: false,
      }]
    })

    Branch.addScope("servicesbyarchive",(archive)=>({
      include: [{
        model: models.Service,
        where: {archive:archive},
        required: false,
      }]
    }))

    Branch.addScope("dentistbyarchive",(archive)=>({
      include: [{
        model: models.Dentist,
        where: {archive:archive},
        required: false,
      }]
    }))


    Branch.addScope("dentist",{
      include: [{
        model: models.Dentist,
        where: {archive:0},
        required: false,
      }]
    })
    
  }
  return Branch;
};