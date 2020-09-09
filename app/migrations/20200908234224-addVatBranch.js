'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Branches', 'vat', {
              type: Sequelize.INTEGER,
              defaultValue: 12
          }, { transaction: t }),
      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Branches', 'vat', { transaction: t }),
      ])
  })
  }
};
