'use strict';
module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    fname: DataTypes.STRING,
    img: DataTypes.STRING,
    Bday: DataTypes.DATEONLY,
    civilstatus: DataTypes.STRING,
    familyId: DataTypes.INTEGER,
    archive: DataTypes.INTEGER,
    gender: DataTypes.STRING,
  }, {});
  Member.associate = function(models) {
    // associations can be defined here
    Member.belongsTo(models.Family)
  };

  Member.loadscope = function(models){
    Member.addScope("active",{
      where: {
        archive: 0,
      }
    })
  }
  return Member;
};