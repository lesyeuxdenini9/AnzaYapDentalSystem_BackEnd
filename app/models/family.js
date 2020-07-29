'use strict';
module.exports = (sequelize, DataTypes) => {
  const Family = sequelize.define('Family', {
    family: DataTypes.STRING,
    QrCode: DataTypes.STRING,
    addressId: DataTypes.INTEGER,
    archive: DataTypes.INTEGER,
  }, {});
  Family.associate = function(models) {
    // associations can be defined here
    Family.belongsTo(models.Address)
    Family.hasMany(models.Member)
  };
  Family.loadscope = function(models){
    Family.addScope("active",{
      where: {
        archive: 0,
      }
    })

    Family.addScope("with_OtherData",{
      include: [
        {
          model: models.Member,where: {archive:0},required:false
        },
        {
          model: models.Address,where:{archive:0},required:false,attributes: ['id','address','householdNo'],
          include: [
            {
              model: models.Barangay,where:{archive:0},required:false,attributes: ['id','barangay','chairman'],
            },
            {
              model: models.Street,where:{archive:0},required:false,attributes: ['id','street'],
            }
          ],
        }
      ]
    })
  }
  return Family;
};