const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  batches: String,
  rollNo:String,
  sname: String,
  aname: String,
  agroup:String,
  host: String,
  competitionLevel:String,
  fdate:String,
  tdate:String,
  // year:String,
  // description: String,
  prizes:String
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
