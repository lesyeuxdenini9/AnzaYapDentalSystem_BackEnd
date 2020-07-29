'use strict';
module.exports = (sequelize, DataTypes) => {
  const Healthcard = sequelize.define('Healthcard', {
    healthcardno: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    loadamount: DataTypes.FLOAT,
    archive: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    healthcardname: DataTypes.STRING,
    accountname: DataTypes.STRING,
    accountNo: DataTypes.STRING,
    billingId: DataTypes.INTEGER,
  }, {});
  Healthcard.associate = function(models) {
    // associations can be defined here
    Healthcard.belongsTo(models.User)
    Healthcard.belongsTo(models.Billing)
  };

  Healthcard.loadscope = function(models){
    Healthcard.addScope("active",{
      where: {
        archive: 0,
      }
    })
  }
  return Healthcard;
};