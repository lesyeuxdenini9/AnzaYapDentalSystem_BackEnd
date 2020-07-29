'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Treatments', 'paymentmethod', {
              type: Sequelize.STRING,
              defaultValue: 'cash',
          }, { transaction: t }),


      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Treatments', 'paymentmethod', { transaction: t }),

      ])
  })
  }
};
