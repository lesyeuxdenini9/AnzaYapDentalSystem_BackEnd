'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Prescriptions', 'actionId', {
              type: Sequelize.INTEGER,
          }, { transaction: t }),
          queryInterface.addColumn('Prescriptions', 'treatmentId', {
            type: Sequelize.INTEGER,
        }, { transaction: t }),

      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Prescriptions', 'actionId', { transaction: t }),
          queryInterface.removeColumn('Prescriptions', 'treatmentId', { transaction: t }),
       
      ])
  })
  }
};
