'use strict';
module.exports = (sequelize, DataTypes) => {
  const Action = sequelize.define('Action', {
    treatmentId: DataTypes.INTEGER,
    actiontaken: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    archive: DataTypes.INTEGER,
    diagnosis: DataTypes.STRING,
    starttime: DataTypes.DATE,
    endtime: DataTypes.DATE,
  }, {});
  Action.associate = function(models) {
    Action.belongsTo(models.Treatment)
    Action.belongsToMany(models.Teeth,{as: 'teeths',through: models.ActionTeeth,foreignKey: 'actionId',otherKey: 'teethId'})
    Action.hasMany(models.Stockout)
  };

  Action.loadscope = function(models){
    Action.addScope("active",{
      where: {
        archive: 0,
      }
    })
  }
  return Action;
};