'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn('Schedules', 'branchId', {
            type: Sequelize.INTEGER,
        }, { transaction: t }),
        queryInterface.addColumn('Users', 'branchId', {
          type: Sequelize.INTEGER,
        }, { transaction: t }),
          queryInterface.addColumn('Billings', 'branchId', {
            type: Sequelize.INTEGER,
        }, { transaction: t }),
          queryInterface.addColumn('Dentists', 'branchId', {
            type: Sequelize.INTEGER,
        }, { transaction: t }),
        queryInterface.addColumn('Reservations', 'branchId', {
              type: Sequelize.INTEGER,
          }, { transaction: t }),
          queryInterface.addColumn('Transactions', 'branchId', {
            type: Sequelize.INTEGER,
        }, { transaction: t }),
        queryInterface.addColumn('Services', 'branchId', {
              type: Sequelize.INTEGER,
          }, { transaction: t }),
          queryInterface.addColumn('Medicines', 'branchId', {
            type: Sequelize.INTEGER,
        }, { transaction: t }),
        queryInterface.addColumn('Notifications', 'branchId', {
          type: Sequelize.INTEGER,
        }, { transaction: t }),
          

      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Schedules', 'branchId', { transaction: t }),
          queryInterface.removeColumn('Users', 'branchId', { transaction: t }),
          queryInterface.removeColumn('Billings', 'branchId', { transaction: t }),
          queryInterface.removeColumn('Dentists', 'branchId', { transaction: t }),
          queryInterface.removeColumn('Reservations', 'branchId', { transaction: t }),
          queryInterface.removeColumn('Transactions', 'branchId', { transaction: t }),
          queryInterface.removeColumn('Services', 'branchId', { transaction: t }),
          queryInterface.removeColumn('Medicines', 'branchId', { transaction: t }),
          queryInterface.removeColumn('Notifications', 'branchId', { transaction: t }),
        
      ])
  })
  }
};
