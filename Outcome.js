const mongoose = require('mongoose');

const OutcomeSchema = new mongoose.Schema({
    coCode: { type: String, required: true },
    description: { type: String, required: true },
    bloomLevel: { type: String, required: true },
    correlationStrength: { type: Number, required: true },
    pos: { type: [String], required: true },
    psos: { type: [String] },
    justification: { type: String },
    attainment: { type: Number, default: 0 }  // Add attainment if needed
});

module.exports = mongoose.model('Outcome', OutcomeSchema);
