'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Dentists', 'archive', {
              type: Sequelize.STRING,
              defaultValue: 0,
          }, { transaction: t }),
      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Dentists', 'archive', { transaction: t }),
          // queryInterface.removeColumn('Person', 'favoriteColor', { transaction: t })
      ])
  })
  }
};
