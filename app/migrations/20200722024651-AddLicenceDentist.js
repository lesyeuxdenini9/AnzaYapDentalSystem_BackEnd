'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Dentists', 'licence', {
              type: Sequelize.STRING,
          }, { transaction: t }),

          queryInterface.addColumn('Dentists', 'ptr', {
            type: Sequelize.STRING,
        }, { transaction: t }),


      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Dentists', 'licence', { transaction: t }),
          queryInterface.removeColumn('Dentists', 'ptr', { transaction: t }),
      ])
  })
  }
};
