'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Reservations', 'Start', {
              type: Sequelize.STRING,
          }, { transaction: t }),

          queryInterface.addColumn('Reservations', 'End', {
            type: Sequelize.STRING,
        }, { transaction: t }),

        queryInterface.addColumn('Transactions', 'Start', {
          type: Sequelize.STRING,
      }, { transaction: t }),

      queryInterface.addColumn('Transactions', 'End', {
        type: Sequelize.STRING,
    }, { transaction: t }),


      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Reservations', 'Start', { transaction: t }),
          queryInterface.removeColumn('Reservations', 'End', { transaction: t }),
          queryInterface.removeColumn('Transactions', 'Start', { transaction: t }),
          queryInterface.removeColumn('Transactions', 'End', { transaction: t }),

      ])
  })
  }
};
