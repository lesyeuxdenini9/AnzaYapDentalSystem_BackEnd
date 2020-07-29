'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Healthcards', 'healthcardname', {
              type: Sequelize.STRING,
          }, { transaction: t }),

          queryInterface.addColumn('Healthcards', 'accountname', {
            type: Sequelize.STRING,
        }, { transaction: t }),

        queryInterface.addColumn('Healthcards', 'accountNo', {
          type: Sequelize.STRING,
      }, { transaction: t }),

      queryInterface.addColumn('Healthcards', 'billingId', {
        type: Sequelize.INTEGER,
    }, { transaction: t }),


      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Healthcards', 'healthcardname', { transaction: t }),
          queryInterface.removeColumn('Healthcards', 'accountname', { transaction: t }),
          queryInterface.removeColumn('Healthcards', 'accountNo', { transaction: t }),
          queryInterface.removeColumn('Healthcards', 'billingId', { transaction: t }),
      ])
  })
  }
};
