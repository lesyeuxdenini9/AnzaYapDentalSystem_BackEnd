'use strict';
module.exports = (sequelize, DataTypes) => {
  const ActionTeeth = sequelize.define('ActionTeeth', {
    actionId: DataTypes.INTEGER,
    teethId: DataTypes.INTEGER,
    // freezeTableName: true,
    // // define the table's name
    // tableName: 'actionteeths'
  }, {});
  ActionTeeth.associate = function(models) {
    // associations can be defined here
  };
  return ActionTeeth;
};