// import sequelize
const Sequelize = require("sequelize");
 
// create connection
const db = new Sequelize('foundem2', 'root', 'Imane213', {
    host: '127.0.0.1',
    dialect: 'mysql'
});
 
// export connection
module.exports= db;