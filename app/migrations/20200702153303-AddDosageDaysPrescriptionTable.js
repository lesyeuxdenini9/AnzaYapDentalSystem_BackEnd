'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Prescriptitems', 'dosage', {
              type: Sequelize.STRING,
          }, { transaction: t }),
          queryInterface.addColumn('Prescriptitems', 'days', {
            type: Sequelize.STRING,
        }, { transaction: t }),

      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Prescriptitems', 'dosage', { transaction: t }),
          queryInterface.removeColumn('Prescriptitems', 'days', { transaction: t }),

      ])
  })
  }
};
