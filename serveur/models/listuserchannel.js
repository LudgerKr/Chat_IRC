'use strict';
module.exports = (sequelize, DataTypes) => {
  const ListUserChannel = sequelize.define('ListUserChannel', {
  }, {});
  ListUserChannel.associate = function(models) {
    models.ListUserChannel.belongsTo(models.User, {
      foreingKey: {
        allowNull: false
      }
    });
    models.ListUserChannel.belongsTo(models.Channel, {
      foreingKey: {
        allowNull: false
      }
    })
    // associations can be defined here
  };
  return ListUserChannel;
};