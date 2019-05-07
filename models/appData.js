const uuid = require('uuid/v4');
const Sequelize = require('sequelize');

const AppInstance = sequelize.define('AppInstance', {
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: uuid(),
  },
  mastodonInstance: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  client_id: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  client_secret: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  // options
});
module.exports = AppInstance;
