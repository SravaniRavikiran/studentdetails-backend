const express = require('express');
const router = express.Router();
const Outcome = require('../Outcome');

// GET all outcomes
router.get('/', async (req, res) => {
    const outcomes = await Outcome.find();
    res.json(outcomes);
});

// POST new outcome
// POST route for submitting CO data
router.post('/', async (req, res) => {
    try {
      const outcome = new Outcome(req.body); // Assuming Outcome is your Mongoose model
      await outcome.save();
      res.status(201).json({ message: 'Outcome saved successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error saving outcome' });
    }
  });
  

module.exports = router;