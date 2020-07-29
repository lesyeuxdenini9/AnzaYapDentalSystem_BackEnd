'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Medicines', 'stocks', {
              type: Sequelize.FLOAT,
              defaultValue:0,
          }, { transaction: t }),

      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Users', 'stocks', { transaction: t }),
       
      ])
  })
  }
};
