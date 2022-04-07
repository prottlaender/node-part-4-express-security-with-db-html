const envy = require('envy')
const env = envy()

const mongodbpath = env.mongodbpath

const mongoose = require('mongoose');

const StartMongoServer = async function() {
  try {

    await mongoose.connect(mongodbpath)
    .then(function() {
      console.log(`Mongoose connection open on ${mongodbpath}`);
    })
    .catch(function(error) {
      console.log(`Connection error message: ${error.message}`);
    })

  } catch(error) {
    res.json( { status: "db connection error", message: error.message } );
  }

};

// mongoose.Promise = global.Promise;

module.exports = StartMongoServer;
