'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Users', 'img', {
              type: Sequelize.STRING
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
          queryInterface.removeColumn('Users', 'img', { transaction: t }),
          // queryInterface.removeColumn('Person', 'favoriteColor', { transaction: t })
      ])
  })
  }
};
