'use strict';
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    name: DataTypes.STRING
  }, {});
  Channel.associate = function(models) {
    // associations can be defined here
    models.Channel.hasMany(models.Message);
    models.Channel.hasMany(models.ListUserChannel);
    models.Channel.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      }
    });
  };
  return Channel;
};