'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Users', 'firstname', {
              type: Sequelize.STRING,
          }, { transaction: t }),
          queryInterface.addColumn('Users', 'middlename', {
            type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.addColumn('Users', 'lastname', {
          type: Sequelize.STRING,
      }, { transaction: t }),
      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Users', 'firstname', { transaction: t }),
          queryInterface.removeColumn('Users', 'middlename', { transaction: t }),
          queryInterface.removeColumn('Users', 'lastname', { transaction: t }),
      ])
  })
  }
};
