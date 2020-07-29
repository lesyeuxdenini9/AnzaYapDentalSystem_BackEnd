'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Actions', 'starttime', {
              type: Sequelize.DATE,
          }, { transaction: t }),
          queryInterface.addColumn('Actions', 'endtime', {
            type: Sequelize.DATE,
        }, { transaction: t }),

      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Actions', 'starttime', { transaction: t }),
          queryInterface.removeColumn('Actions', 'endtime', { transaction: t }),
      ])
  })
  }
};
