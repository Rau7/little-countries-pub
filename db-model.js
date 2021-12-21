var connection = require('./db-connection');

const db = connection.mongoose.connection;

const Schema = connection.mongoose.Schema;

let country = new Schema(
  {
    name: {
      type: String
    },
    region: {
      type: String
    }
  },
  { collection: "countries" }
);

const Countries = connection.mongoose.model("countries",country);


module.exports = {
    Countries
}