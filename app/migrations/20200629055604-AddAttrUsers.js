'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Users', 'gender', {
              type: Sequelize.STRING,
          }, { transaction: t }),
          queryInterface.addColumn('Users', 'history', {
            type: Sequelize.STRING,
        }, { transaction: t }),

      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Users', 'gender', { transaction: t }),
          queryInterface.removeColumn('Users', 'history', { transaction: t }),
       
      ])
  })
  }
};
