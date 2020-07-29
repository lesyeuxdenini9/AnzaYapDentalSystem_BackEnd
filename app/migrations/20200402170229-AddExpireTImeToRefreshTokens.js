'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Refreshtokens', 'expiresAt', {
              type: Sequelize.DATE
          }, { transaction: t }),
          // queryInterface.addColumn('Person', 'favoriteColor', {
          //     type: Sequelize.STRING,
          // }, { transaction: t })
      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Refreshtokens', 'expiresAt', { transaction: t }),
          // queryInterface.removeColumn('Person', 'favoriteColor', { transaction: t })
      ])
  })
  }
};
