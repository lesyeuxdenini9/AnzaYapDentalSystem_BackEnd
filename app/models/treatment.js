'use strict';
module.exports = (sequelize, DataTypes) => {
  const Treatment = sequelize.define('Treatment', {
    transactionId: DataTypes.INTEGER,
    service: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    discount: DataTypes.FLOAT,
    status: DataTypes.INTEGER,
    remarks: DataTypes.STRING,
    archive: DataTypes.INTEGER,
    reservationId: DataTypes.INTEGER,
    serviceId: DataTypes.INTEGER,
    actualAmount: DataTypes.FLOAT,
    paymentmethod: DataTypes.STRING,
    default_: DataTypes.INTEGER,
  }, {});
  Treatment.associate = function(models) {
    Treatment.belongsTo(models.Transaction)
    Treatment.belongsTo(models.Reservation)
    Treatment.hasMany(models.Action)
    Treatment.belongsTo(models.Service)
  };

  Treatment.loadscope = function(models){
    Treatment.addScope("active",{
      where: {
        archive: 0,
      }
    })

    Treatment.addScope("default",{
      where: {
        default_: 1,
      }
    })
  }

  
  return Treatment;
};