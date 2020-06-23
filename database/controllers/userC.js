// database/controllers/userController.js

// load the modules
const bcrypt = require('bcryptjs');
// define hash saltrounds
const saltRounds = 10;

// load the models
const User = require('../models/userM');

module.exports = {

  createUser: async function (req, res) {
    // assign input data from request body to input variables
    const name = req.body.name
    const lastname = req.body.lastname
    const email = req.body.email
    const password = req.body.password
    const role = req.body.role

    const newUser = new User({
      name: name,
      lastname: lastname,
      email: email,
      password: password,
      role: role
    })

    newUser.password = await bcrypt.hash(newUser.password, saltRounds)

    await newUser.save(function(err, user) {
          if (err) {
            // if a validation err occur end request and send response
            res.status(400).send({ code: 400, status: 'Bad Request', message: err.message })
          } else {
            req.session.userId = user._id

            var userData = { name: user.name, lastname: user.lastname, email: user.email, role: user.role }

            req.session.userData = userData

            res.redirect('/dashboard')
          }
        })
  },

  loginUser: function (req, res) {

    User.findOne({ email: req.body.email }, function(error, user) {
      if (!user) {
        res.status(400).send({ code: 400, status: 'Bad Request', message: 'No User found with this email' })

      } else {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          req.session.userId = user._id

          var userData = { name: user.name, lastname: user.lastname, email: user.email, role: user.role }

          req.session.userData = userData

          res.redirect('/dashboard')

        } else {
          res.status(400).send({ code: 400, status: 'Bad Request', message: 'Wrong User password' })
        }

      }
    })

  }

// End export the User Controller Modules
}
