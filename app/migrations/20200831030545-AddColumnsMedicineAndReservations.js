'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Reservations', 'isResched', {
              type: Sequelize.INTEGER,
              defaultValue: 0
          }, { transaction: t }),
          queryInterface.addColumn('Medicines', 'scientificName', {
            type: Sequelize.TEXT,
        }, { transaction: t }),
        queryInterface.addColumn('Medicines', 'brand', {
          type: Sequelize.STRING,
      }, { transaction: t }),
          queryInterface.addColumn('Stockinitems', 'ExpirationDate', {
            type: Sequelize.DATEONLY,
        }, { transaction: t }),

      
      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Reservations', 'isResched', { transaction: t }),
          queryInterface.removeColumn('Medicines', 'scientificName', { transaction: t }),
          queryInterface.removeColumn('Medicines', 'brand', { transaction: t }),
          queryInterface.removeColumn('Stockinitems', 'ExpirationDate', { transaction: t }),

      ])
  })
  }
};
