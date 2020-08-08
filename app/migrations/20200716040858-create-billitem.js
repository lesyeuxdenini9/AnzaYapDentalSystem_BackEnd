'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Billitems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      billingId: {
        type: Sequelize.INTEGER
      },
      item: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      medicineId: {
        type: Sequelize.INTEGER
      },
      qty: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      price: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      amount: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
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
    return queryInterface.dropTable('Billitems');
  }
};