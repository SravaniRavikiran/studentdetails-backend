const mongoose = require('mongoose');

const studentDetailsSchema = new mongoose.Schema({
  name: String,
  fatherName: String,
  rollNo: String,
  batch:String,
  branch:String,
  mobileNumber: String,
  parentNumber: String,
  email: String,
  dateOfBirth: Date,
  address: String,
  gender: String,
  githubLink: { type: String }, // GitHub Link
  image: { type: String }, // URL or path of the uploaded image
  certificate: { type: String }, // URL or path of the uploaded certificate
});

const StudentDetails = mongoose.model('StudentDetails', studentDetailsSchema);

module.exports = StudentDetails;
