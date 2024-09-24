const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const Student = require('./StudentSchema'); // Ensure you have the Student model
const StudentDetails = require('./StudentdetailsSchema'); // Ensure you have the Student model
const Activity = require('./Activity');
const Eactivity = require('./Eactivity');
const Signup = require('./SignupSchema');
const StudentExtra = require('./StudentExtra');
const router = express.Router();
const studentExtraRoutes = require('./routes/studentExtraRoutes');
const outcomesRoute = require('./routes/outcomes');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect('mongodb+srv://132429sr:cxV2moxnFYZxT2Ts@studentprofileapi.ulmm7.mongodb.net/studentmarksnew', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
}).then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => {
  console.error('Error connecting to MongoDB Atlas:', err.message);
});
app.use('/api/outcomes', outcomesRoute);

//siggnup mongodb
app.post('/signup', async (req, res) => {
  try {
    const { fname, lname, email, rollno, pwd, role = 'student' } = req.body;  // Default role to 'student'
    const hashedPassword = await bcrypt.hash(pwd, 10);  // Hash the password

    const newUser = new Signup({
      fname,
      lname,
      email,
      rollno,
      pwd: hashedPassword,  // Store the hashed password
      role,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error saving user:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



app.post('/login', async (req, res) => {
  const { email, pwd } = req.body;

  try {
    const user = await Signup.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(pwd, user.pwd);  // Compare password
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, 'secretKey', { expiresIn: '1h' });  // Generate JWT

    // Ensure the response contains the user role
    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});


//Activities
// API to upload activity data
app.post('/upload-activity', async (req, res) => {
  try {
      const { activityData } = req.body;

      // Iterate through the activity data and store each entry
      for (const activity of activityData) {
          console.log('Processing activity:', activity);
          
          const { batches, rollNo, sname, aname, agroup, host, competitionLevel, fdate, tdate, prizes } = activity;
          const newActivity = new Activity({ batches, rollNo, sname, aname, agroup, host, competitionLevel, fdate, tdate, prizes });
          await newActivity.save();
      }

      res.status(201).send('Activities uploaded successfully');
  } catch (error) {
      console.error('Error uploading activities:', error);
      res.status(500).send('Error uploading activities');
  }
});
app.get('/activity/rollNo', async (req, res) => {
  try {
    const { rollNo } = req.query;

    // Build the query object
    let query = {};
    if (rollNo) query.rollNo = rollNo;

    // Fetch data based on query
    const activityData = await Activity.find(query);

    if (activityData.length === 0) {
      return res.status(404).send('No activities found for the given batch');
    }

    res.json(activityData);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).send('Error fetching grades');
  }
});

app.get('/activity/batch', async (req, res) => {
  try {
    const { batches } = req.query;

    // Build the query object
    let query = {};
    if (batches) query.batches = batches;

    // Fetch data based on query
    const activityData = await Activity.find(query);

    if (activityData.length === 0) {
      return res.status(404).send('No activities found for the given batch');
    }

    res.json(activityData);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).send('Error fetching grades');
  }
});

app.post('/upload-eactivity', async (req, res) => {
  try {
    const { eactivityData } = req.body;

    // Iterate through the activity data and store each entry
    for (const eactivity of eactivityData) {
        console.log('Processing activity:', eactivity);
        
        const { batches, rollNo, sname, aname, agroup, host, competitionLevel, fdate, tdate, prizes } = eactivity;
        const newEactivity = new Eactivity({ batches, rollNo, sname, aname, agroup, host, competitionLevel, fdate, tdate, prizes });
        await newEactivity.save();
    }

    res.status(201).send('Activities uploaded successfully');
} catch (error) {
    console.error('Error uploading activities:', error);
    res.status(500).send('Error uploading activities');
}
});


app.get('/eactivity/rollNo', async (req, res) => {
  try {
    const { rollNo } = req.query;

    // Build the query object
    let query = {};
    if (rollNo) query.rollNo = rollNo;

    // Fetch data based on query
    const eactivityData = await Eactivity.find(query);

    if (eactivityData.length === 0) {
      return res.status(404).send('No activities found for the given batch');
    }

    res.json(eactivityData);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).send('Error fetching grades');
  }
});

app.get('/eactivity/batch', async (req, res) => {
  try {
    const { batches } = req.query;

    // Build the query object
    let query = {};
    if (batches) query.batches = batches;

    // Fetch data based on query
    const eactivityData = await Eactivity.find(query);

    if (eactivityData.length === 0) {
      return res.status(404).send('No activities found for the given batch');
    }

    res.json(eactivityData);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).send('Error fetching grades');
  }
});

//Student Marks
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  console.log('File uploaded to:', filePath);

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).send('No sheets found in the uploaded file.');
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return res.status(400).send('Sheet data is undefined.');
    }

    const jsonData = XLSX.utils.sheet_to_json(sheet);
    console.log('Excel data:', jsonData);

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Save data to MongoDB
    await Student.insertMany(jsonData);

    res.json({ message: 'File uploaded and data saved to database successfully.' });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/students', async (req, res) => {
  try {
    const students = await Student.find({});
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/students/:rollNo', async (req, res) => {
  try {
    const updatedStudent = await Student.findOneAndUpdate({ rollNo: req.params.rollNo, subjectCode: req.body.subjectCode }, req.body, { new: true });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/students/:rollNo/:subjectCode', async (req, res) => {
  try {
    const { rollNo, subjectCode } = req.params;
    const student = await Student.findOneAndDelete({ rollNo, subjectCode });
    if (!student) {
      return res.status(404).send('Student not found');
    }
    res.json(student);
  } catch (error) {
    console.error('Error deleting student data:', error);
    res.status(500).send('Internal Server Error');
  }
});

//studentdetails

// Save or update GitHub link, profile picture, and certificate
app.use('/', studentExtraRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




app.post('/upload-student-details', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  console.log('File uploaded to:', filePath);

  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).send('No sheets found in the uploaded file.');
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return res.status(400).send('Sheet data is undefined.');
    }

    const jsonData = XLSX.utils.sheet_to_json(sheet);
    console.log('Excel data:', jsonData);

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Save data to MongoDB
    await StudentDetails.insertMany(jsonData);

    res.json({ message: 'File uploaded and data saved to database successfully.' });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/studentdetails', async (req, res) => {
  try {
    const studentDetails = await StudentDetails.find({});
    res.json(studentDetails);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).send('Internal Server Error');
  }
});
// Endpoint to archive a batch of students
app.patch('/studentdetails/archive-batch', async (req, res) => {
  try {
    const { batch } = req.body;
    await Student.updateMany({ batch: batch }, { archived: true });
    res.json({ message: 'Batch archived successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to archive batch.' });
  }
});
//Get whole Data

app.get('/student/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;

    console.log(`Fetching details for roll number: ${rollNo}`);
    
    // Fetch student details
    const studentDetails = await StudentDetails.findOne({ rollNo });
    if (!studentDetails) {
      console.error('Student details not found for roll number:', rollNo);
      return res.status(404).send('Student details not found');
    }

    // Fetch student marks
    const studentMarks = await Grade.find({ rollNo });

    // Fetch co-curricular activities
    const activities = await Activity.find({ rollNo });

    // Fetch extra-curricular activities
    const eactivities = await Eactivity.find({ rollNo });

    // Fetch extra student details (GitHub link, profile picture, certificate)
    const studentExtra = await StudentExtra.findOne({ rollNo });

    res.json({
      studentDetails,
      studentMarks,
      activities,
      eactivities,
      studentExtra, // Include the extra student details
    });
  } catch (error) {
    console.error('Error fetching student data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});


app.use('/files', express.static("files"));

const corsOptions = {
  origin: 'http://localhost:3000', // Your frontend's origin
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Admin@123',
  database: 'studentprofile'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    throw err;
  }
  console.log('MySQL connected');
});

app.post('/signup', (req, res) => {
  const { fname, lname, email, rollno, pwd, role } = req.body;
  const hashedPassword = bcrypt.hashSync(pwd, 10);
  const sql = 'INSERT INTO users (fname, lname, email, rollno, password, role) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [fname, lname, email, rollno, hashedPassword, role], (err, result) => {
    if (err) {
      console.error('Error signing up user:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.status(201).send('User registered');
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error logging in:', err);
      res.status(500).send('Internal Server Error');
    } else if (results.length === 0) {
      res.status(401).send('Invalid email or password');
    } else {
      const user = results[0];
      if (bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id, role: user.role }, 'secretkey', { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).send('Invalid email or password');
      }
    }
  });
});


// Schema for grades
const GradeSchema = new mongoose.Schema({
 
  subjects: {
      type: Map, // Map of subject codes and grades
      of: String
  },
  sgpa:Number,
  semester:String,
  rollNo: String,
  branch:String,
  batch:String,
});

const Grade = mongoose.model('Grade', GradeSchema);

// API to upload grade data
app.post('/upload-grades', async (req, res) => {
  try {
      const { gradesData } = req.body;

      // Iterate through the grades data and store each roll number and its subjects
      for (const grade of gradesData) {
          const { rollNo, batch, branch, subjects, sgpa, semester } = grade;
          const existingGrade = await Grade.findOne({ rollNo });

          
              // Create a new grade entry only if it doesn't exist
              const newGrade = new Grade({ rollNo, batch, branch, subjects, sgpa, semester });
              await newGrade.save();
         
      }

      res.status(201).send('Grades uploaded successfully');
  } catch (error) {
      res.status(500).send('Error uploading grades');
  }
});





// API to fetch grade data by roll number
// API to fetch grade data by roll number and semester
app.get('/grades', async (req, res) => {
  try {
    const { rollNo, semester } = req.query;

    // Build the query object
    let query = {};
    if (rollNo) query.rollNo = rollNo;
    if (semester) query.semester = semester;

    // Fetch data based on query
    const gradeData = await Grade.find(query);

    if (gradeData.length === 0) {
      return res.status(404).send('No grades found for the given criteria');
    }

    res.json(gradeData);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).send('Error fetching grades');
  }
});



app.listen(5000, () => {
  console.log('Server is running on port 5000');
});


mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});
