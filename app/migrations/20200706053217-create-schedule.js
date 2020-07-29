'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      index: {
        type: Sequelize.INTEGER,
        allowNull:false,
      },
      day: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      start: {
        type: Sequelize.STRING,
        defaultValue: '00:00'
      },
      end: {
        type: Sequelize.STRING,
        defaultValue: '00:00'
      },
      active: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
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
    return queryInterface.dropTable('Schedules');
  }
};