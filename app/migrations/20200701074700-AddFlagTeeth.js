'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Teeth', 'flag', {
              type: Sequelize.INTEGER,
              defaultValue:0,
          }, { transaction: t }),

      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Teeth', 'flag', { transaction: t }),
       
      ])
  })
  }
};
