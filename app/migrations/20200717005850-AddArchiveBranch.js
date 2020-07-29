'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Branches', 'archive', {
              type: Sequelize.INTEGER,
              defaultValue: 0,
          }, { transaction: t }),


      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Branches', 'archive', { transaction: t }),

      ])
  })
  }
};
