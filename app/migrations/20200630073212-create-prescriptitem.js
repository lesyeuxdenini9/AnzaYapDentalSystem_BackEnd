'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Prescriptitems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      prescriptionId: {
        type: Sequelize.INTEGER
      },
      medicine: {
        type: Sequelize.STRING
      },
      qty: {
        type: Sequelize.FLOAT,
        defaultValue:0,
      },
      amount: {
        type: Sequelize.FLOAT,
        defaultValue:0,
      },
      archive: {
        type: Sequelize.INTEGER,
        defaultValue:0,
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
    return queryInterface.dropTable('Prescriptitems');
  }
};