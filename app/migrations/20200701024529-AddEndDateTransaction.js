'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Transactions', 'transactionEndDate', {
              type: Sequelize.DATEONLY,
          }, { transaction: t }),

      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Transactions', 'transactionEndDate', { transaction: t }),
       
      ])
  })
  }
};
