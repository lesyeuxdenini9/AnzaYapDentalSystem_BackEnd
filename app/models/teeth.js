'use strict';
module.exports = (sequelize, DataTypes) => {
  const Teeth = sequelize.define('Teeth', {
    userId: DataTypes.INTEGER,
    orderNo: DataTypes.INTEGER,
    flag: DataTypes.INTEGER,
  }, {});
  Teeth.associate = function(models) {
    Teeth.belongsTo(models.User)
    Teeth.belongsToMany(models.Action,{as: 'actions',through: models.ActionTeeth,foreignKey: 'teethId',otherKey: 'actionId'})
  };
  return Teeth;
};