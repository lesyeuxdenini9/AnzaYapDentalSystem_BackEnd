'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Reservations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reservationNo: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATEONLY
      },
      starttime: {
        type: Sequelize.DATE
      },
      endtime: {
        type: Sequelize.DATE
      },
      userId: {
        type: Sequelize.INTEGER
      },
      dentistId: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue:0,
      },
      type: {
        type: Sequelize.INTEGER,
        defaultValue:0,
      },
      expired: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      approvedBy: {
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
    return queryInterface.dropTable('Reservations');
  }
};