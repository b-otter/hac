import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.get('/api/proxycrawl', async (req, res) => {
  try {
    const { url } = req.query;
    const response = await axios.get(`https://api.proxycrawl.com/?token=rb2ynfA_vNdk90lhzWedvQ&url=${url}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'energo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


db.getConnection()
  .then(conn => {
    conn.release();
    console.log('MySQL connected successfully');
  })
  .catch(err => {
    console.error('MySQL connection error:', err);
  });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});


app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        accountId as accountd, 
        isCommercial, 
        address, 
        buildingType, 
        roomsCount, 
        residentsCount, 
        totalArea,
        jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, december
      FROM users
      ORDER BY accountId
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users',
      details: error.message
    });
  }
});


app.get('/api/normalize', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        rooms, 
        residents, 
        jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, december
      FROM normalize
      ORDER BY rooms, residents
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch normalize data',
      details: error.message
    });
  }
});

app.get('/api/high-consumers', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        accountId as accountId,
        isCommercial,
        address,
        buildingType,
        roomsCount,
        residentsCount,
        totalArea,
        oct, nov, december, jan, feb, mar, apr,
        ((oct + nov + december + jan + feb + mar + apr) / 7) AS avg_consumption
      FROM users
      HAVING avg_consumption > 3000
      ORDER BY avg_consumption DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching high consumers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch high consumers',
      details: error.message,
    });
  }
});



app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      error: 'No file uploaded'
    });
  }

  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    if (!Array.isArray(jsonData)) {
      throw new Error('Invalid JSON format: expected array');
    }

    const values = jsonData.map(item => {
      if (!item.accountId) {
        throw new Error('Missing required field: accountId');
      }

      return [
        item.accountId,
        item.isCommercial || false,
        item.address || null,
        item.buildingType || null,
        item.roomsCount || null,
        item.residentsCount || null,
        item.totalArea || null,
        item.consumption?.['1'] || 0,
        item.consumption?.['2'] || 0,
        item.consumption?.['3'] || 0,
        item.consumption?.['4'] || 0,
        item.consumption?.['5'] || 0,
        item.consumption?.['6'] || 0,
        item.consumption?.['7'] || 0,
        item.consumption?.['8'] || 0,
        item.consumption?.['9'] || 0,
        item.consumption?.['10'] || 0,
        item.consumption?.['11'] || 0,
        item.consumption?.['12'] || 0
      ];
    });


    const [result] = await db.query(`
      REPLACE INTO users 
      (accountId, isCommercial, address, buildingType, roomsCount, residentsCount, totalArea, 
       jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, december) 
      VALUES ?`, [values]);

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Данные успешно загружены',
      recordsAffected: result.affectedRows
    });

  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'File processing failed',
      details: error.message
    });
  }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});