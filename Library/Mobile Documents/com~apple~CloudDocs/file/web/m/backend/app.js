const express = require("express");
const mysql = require('mysql');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const axios = require('axios');

dotenv.config({ path: './.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['POST', 'GET'],
  credentials: true,
}));

const csrfProtection = csurf({ cookie: true });

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

function generateAccessToken(username, userType) {
  const token = jwt.sign({ username, userType }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
  return token;
}

const authMiddleware = (req, res, next) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return res.status(401).json({ Error: "No token provided" });

  const cookiePairs = cookieHeader.split(';');
  let token = null;
  for (const pair of cookiePairs) {
    const [key, value] = pair.trim().split('=');
    if (key === 'access-token') {
      token = value;
      break;
    }
  }
  if (!token) {
    return res.status(401).json({ Error: "No token provided" });
  } else {
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ Error: "Invalid token" });
      } else {
        req.username = decoded.username;
        req.userType = decoded.userType;
        next();
      }
    });
  }
};

app.get('/', authMiddleware, (req, res) => {
  return res.json({ Status: "Success", username: req.username, userType: req.userType });
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MySQL connected...");
  }
});

const saltRounds = 10;

// Helper function to validate CAPTCHA
const validateCaptcha = async (captchaToken) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

  try {
    const response = await axios.post(url);
    return response.data.success;
  } catch (err) {
    console.error('Error validating CAPTCHA', err);
    return false;
  }
};

app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post('/register', csrfProtection, async (req, res) => {
  const captchaValid = await validateCaptcha(req.body.captchaToken);
  if (!captchaValid) {
    return res.status(400).send({ Error: 'Invalid CAPTCHA' });
  }

  const sql = "INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)";
  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      return res.status(500).send("Internal server error");
    }
    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
      if (err) {
        return res.status(500).send("Internal server error");
      }
      const sentUsername = req.body.username;
      const userType = req.body.userType; // Get user type from the request body
      const values = [sentUsername, hash, userType];
      db.query(sql, values, (err, result) => {
        if (err) {
          return res.status(500).send("Internal server error");
        }
        res.send({ Status: "Success" });
      });
    });
  });
});

let refreshTokens = [];

app.post('/login', csrfProtection, async (req, res) => {
  const captchaValid = await validateCaptcha(req.body.captchaToken);
  if (!captchaValid) {
    return res.status(400).send({ Error: 'Invalid CAPTCHA' });
  }

  const sentusername = req.body.username;
  const values = [sentusername];
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, values, (err, results) => {
    if (err) {
      return res.json({ Error: err });
    }
    if (results.length > 0) {
      bcrypt.compare(req.body.password.toString(), results[0].password, (err, response) => {
        if (err) return res.json({ Error: "Invalid username or password" });
        if (response) {
          const username = results[0].username;
          const userType = results[0].user_type; // Assuming user_type column exists in your database
          const token = generateAccessToken(username, userType);
          const refreshToken = jwt.sign({ username, userType }, process.env.REFRESH_TOKEN_SECRET);
          refreshTokens.push(refreshToken);
          res.cookie('access-token', token);
          return res.json({ Status: "Success", token, refreshToken });
        } else {
          return res.json({ Error: "Invalid username or password" });
        }
      });
    } else {
      return res.json({ Error: "Login failed. Invalid username or password" });
    }
  });
});

app.post('/token', csrfProtection, (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.sendStatus(401);
  }
  if (!refreshTokens.includes(token)) {
    return res.sendStatus(403);
  }
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    const accessToken = generateAccessToken(user.username, user.userType);
    res.json({ accessToken });
  });
});

app.post('/checkout', csrfProtection, async (req, res) => {
    const { cartItems, totalAmount, captchaToken } = req.body;

    const isCaptchaValid = await validateCaptcha(captchaToken);
    if (!isCaptchaValid) {
        return res.status(400).json({ status: 'Error', message: 'Invalid CAPTCHA' });
    }

    // Process the order here
    // You would typically save the order details in the database
    // and handle payment processing, etc.

    return res.json({ status: 'Success', message: 'Order processed successfully' });
});



app.post('/logout', csrfProtection, (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter(t => t !== token);
  res.send("Logout successful");
});

app.get('/logout', authMiddleware, (req, res) => {
  res.clearCookie('access-token');
  return res.json({ Status: "Success" });
});

app.listen(5001, () => {
  console.log("Server is running on port 5001");
});
