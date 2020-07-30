'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    transactionNo: DataTypes.STRING,
    transactionDate: DataTypes.DATEONLY,
    status: DataTypes.INTEGER,
    archive: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    amountpaid: DataTypes.FLOAT,
    dentist: DataTypes.STRING,
    dentistId: DataTypes.INTEGER,
    createdBy: DataTypes.STRING,
    modifiedBy: DataTypes.STRING,
    remarks: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    reservationId: DataTypes.INTEGER,
    transactionEndDate: DataTypes.DATEONLY,
    billStatus: DataTypes.INTEGER,
    toothType: DataTypes.INTEGER,
    branchId: DataTypes.INTEGER,
    discount: DataTypes.FLOAT,
    medRemarks: DataTypes.STRING,
    Start: DataTypes.STRING,
    End: DataTypes.STRING
  }, {});
  Transaction.associate = function(models) {
    // associations can be defined here
    Transaction.hasMany(models.Treatment)
    Transaction.hasMany(models.Prescription)
    Transaction.hasMany(models.Reservation)
    Transaction.belongsTo(models.User)
    Transaction.belongsTo(models.Branch)
    Transaction.hasMany(models.Billing)
    Transaction.belongsTo(models.Dentist)
  };

  Transaction.loadscope = function(models){
    Transaction.addScope("active",{
      where: {
        archive: 0,
      }
    })
  }


  return Transaction;
};