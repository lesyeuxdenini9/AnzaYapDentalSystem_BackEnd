'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.addColumn('Users', 'bday', {
              type: Sequelize.DATEONLY
          }, { transaction: t }),
          queryInterface.addColumn('Users', 'address', {
              type: Sequelize.STRING,
          }, { transaction: t }),
          queryInterface.addColumn('Users', 'contact', {
            type: Sequelize.STRING,
        }, { transaction: t }),
        queryInterface.addColumn('Users', 'employeeNo', {
          type: Sequelize.STRING,
      }, { transaction: t }),
      ])
  })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
          queryInterface.removeColumn('Users', 'bday', { transaction: t }),
          queryInterface.removeColumn('Users', 'address', { transaction: t }),
          queryInterface.removeColumn('Users', 'contact', { transaction: t }),
          queryInterface.removeColumn('Users', 'employeeNo', { transaction: t })
      ])
  })
  }
};
