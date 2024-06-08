
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(cors());
const validVerificationCode = '0516';



// MongoDB connection
mongoose.connect('mongodb+srv://pavan:pavan@cluster0.idbadvj.mongodb.net/media', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define schema and model for images/videos
const ImageVideoSchema = new mongoose.Schema({
  data: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  }
});

const ImageVideo = mongoose.model('ImageVideo', ImageVideoSchema);

// Multer setup for file uploading
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Handle POST request to upload image or video
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const data = fs.readFileSync(req.file.path).toString('base64');
    const contentType = req.file.mimetype;
    const newImageVideo = new ImageVideo({ data, contentType });
    await newImageVideo.save();
    fs.unlinkSync(req.file.path); // delete the temporary file
    res.status(201).json({ message: 'Image/Video uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post('/verify', (req, res) => {
  const { code } = req.body;
  if (code === validVerificationCode) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect verification code' });
  }
});

// Handle GET request to retrieve all images/videos
app.get('/imagesvideos', async (req, res) => {
  try {
    const imagesVideos = await ImageVideo.find();
    res.status(200).json(imagesVideos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/', (req, res) => {
  res.send('Server started');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
