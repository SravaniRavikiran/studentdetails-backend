const express = require('express');
const router = express.Router();
const StudentExtra = require('../StudentExtra');
const multer = require('multer');
const path = require('path');

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route to handle updating student extra details
router.put('/student-extra/:rollNo', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  const { rollNo } = req.params;
  const githubLink = req.body.githubLink;
  const codeChef = req.body.codeChef;
  const hacker = req.body.hacker;
  const leetCode = req.body.leetCode;

  const profilePicture = req.files['profilePicture'] 
    ? req.files['profilePicture'][0].path 
    : null;
  
  const certificate = req.files['certificate'] 
    ? req.files['certificate'][0].path 
    : null;

  try {
    const updatedData = await StudentExtra.findOneAndUpdate(
      { rollNo },
      { 
        githubLink,
        codeChef,
        hacker,
        leetCode,
        profilePicture, 
        certificate 
      },
      { new: true, upsert: true }
    );
    res.status(200).send(updatedData);
  } catch (error) {
    res.status(500).send('Failed to update student extra details');
  }
});


  
router.get('/student-extra/:rollNo', async (req, res) => {
    const { rollNo } = req.params;
  
    try {
      const studentExtra = await StudentExtra.findOne({ rollNo });
      if (!studentExtra) {
        return res.status(404).send('No extra details found for this student');
      }
      res.status(200).send(studentExtra);
    } catch (error) {
      console.error('Error fetching student extra details:', error.message);
      res.status(500).send('Internal Server Error');
    }
  });
module.exports = router;
