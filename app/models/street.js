'use strict';
module.exports = (sequelize, DataTypes) => {
  const Street = sequelize.define('Street', {
    street: DataTypes.STRING,
    purokLeader: DataTypes.STRING,
    barangayId: DataTypes.INTEGER,
    archive: DataTypes.INTEGER,
  }, {});
  Street.associate = function(models) {
    // associations can be defined here
    Street.hasMany(models.Address)
    Street.belongsTo(models.Barangay)
  };

  Street.loadscope = function(models){
    Street.addScope("active",{
      where: {
        archive: 0,
      }
    })
  }

  return Street;
};