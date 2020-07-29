'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Stockinitems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      stockinId: {
        type: Sequelize.INTEGER
      },
      medicineId: {
        type: Sequelize.INTEGER
      },
      medicine: {
        type: Sequelize.STRING
      },
      qty: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      uom: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Stockinitems');
  }
};