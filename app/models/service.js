'use strict';
module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    description: DataTypes.STRING,
    regularPrice: DataTypes.FLOAT,
    discountedPrice: DataTypes.FLOAT,
    archive: DataTypes.INTEGER,
    service: DataTypes.STRING,
    branchId: DataTypes.INTEGER,
    category: DataTypes.STRING,
  }, {});
  Service.associate = function(models) {
    // associations can be defined here
    Service.belongsTo(models.Branch)
    Service.hasMany(models.Treatment)
  };

  Service.loadscope = function(models){
    Service.addScope("active",{
        where: {
          archive: 0,
        }
    })
  }
  return Service;
};