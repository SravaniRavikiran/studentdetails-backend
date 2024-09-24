const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  rollno:String,
  pwd:String,
  role: String,
});

const Signup = mongoose.model('Signup', signupSchema);

module.exports = Signup;
