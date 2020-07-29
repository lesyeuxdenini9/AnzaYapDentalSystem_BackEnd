'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transactionNo: {
        type: Sequelize.STRING
      },
      transactionDate: {
        type: Sequelize.DATEONLY
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue:0,
      },
      archive: {
        type: Sequelize.INTEGER,
        defaultValue:0,
      },
      price: {
        type: Sequelize.FLOAT,
        defaultValue:0,
      },
      amountpaid: {
        type: Sequelize.FLOAT,
        defaultValue:0,
      },
      dentist: {
        type: Sequelize.STRING
      },
      dentistId: {
        type: Sequelize.INTEGER
      },
      createdBy: {
        type: Sequelize.STRING
      },
      modifiedBy: {
        type: Sequelize.STRING
      },
      remarks: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.INTEGER
      },
      reservationId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Transactions');
  }
};