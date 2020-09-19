'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Branches', 'vat', {
              type: Sequelize.INTEGER,
              defaultValue: 12
          }, { transaction: t }),
      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Branches', 'vat', { transaction: t }),
      ])
  })
  }
};
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Services', 'category', {
              type: Sequelize.STRING,
          }, { transaction: t }),
      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Services', 'category', { transaction: t }),
      ])
  })
  }
};
