'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    content: DataTypes.TEXT,
  }, {});
  Message.associate = function(models) {
    models.Message.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      }
    });
    models.Message.belongsTo(models.Channel, {
      foreignKey: {
        allowNull: true
      }
    });
  };
  return Message;
};