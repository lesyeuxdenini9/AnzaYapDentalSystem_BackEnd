'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Treatments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transactionId: {
        type: Sequelize.INTEGER
      },
      service: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.FLOAT,
        defaultValue:0,
      },
      discount: {
        type: Sequelize.FLOAT,
        defaultValue:0,
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue:0,
      },
      remarks: {
        type: Sequelize.STRING
      },
      archive: {
        type: Sequelize.INTEGER,
        defaultValue:0,
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
    return queryInterface.dropTable('Treatments');
  }
};