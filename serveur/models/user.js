'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    online: DataTypes.BOOLEAN,
    socketId: DataTypes.INTEGER
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    models.User.hasMany(models.Message);
    models.User.hasMany(models.ListUserChannel);
    models.User.hasMany(models.Channel);
  };
  return User;
};