'use strict';
module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define('Schedule', {
    index: DataTypes.INTEGER,
    day: DataTypes.STRING,
    start: DataTypes.STRING,
    end: DataTypes.STRING,
    active: DataTypes.INTEGER,
    branchId: DataTypes.INTEGER,
  }, {});
  Schedule.associate = function(models) {
    // associations can be defined here
    Schedule.belongsTo(models.Branch)
  };
  return Schedule;
};