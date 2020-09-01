'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Users', 'pushnotiftoken', {
              type: Sequelize.TEXT,
              defaultValue: ''
          }, { transaction: t }),


      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Users', 'pushnotiftoken', { transaction: t }),

      ])
  })
  }
};
