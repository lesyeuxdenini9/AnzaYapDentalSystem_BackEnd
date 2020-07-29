'use strict';
const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const Barangay = sequelize.define('Barangay', {
    barangay: DataTypes.STRING,
    code: DataTypes.STRING,
    district: DataTypes.INTEGER,
    chairman: DataTypes.STRING,
    archive: DataTypes.INTEGER,
  }, {});
  Barangay.associate = function(models) {
    // associations can be defined here
    Barangay.hasMany(models.Street)
    Barangay.hasMany(models.Address)
  };

  Barangay.loadscope = function(models){
    Barangay.addScope("active",{
      where: {
        archive: 0,
      }
    })
  
    Barangay.addScope("withStreet_Address",{
      include: [
        {
            model: models.Street,where: {archive:0},required:false,right:false,
            include: [
                {
                model: models.Address,where: {archive:0},required:false,right:false,
                }
            ],
        }
    ]
    })

    Barangay.addScope("findbyId",(idno)=>{
      return {
        where: {
          id: idno,
        }
      }
    })
  }

  return Barangay;
};