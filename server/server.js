const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const User = require('./src/models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./src/middleware/auth.middleware');
const Task = require('./src/models/task.model');
const redisClient = require('./src/config/redis');

const app = express();

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// connect DB
connectDB();

app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

app.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.json({
      message: 'User created successfully',
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // generate token
    const token = jwt.sign(
      { userId: user._id },
      'secretkey',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tasks', authMiddleware, async (req, res) => { // create task
  try {
    const { title, description } = req.body;

    const task = await Task.create({
      title,
      description,
      user: req.userId
    });
    await redisClient.del(`tasks:${req.userId}`); // invalidate cache
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.get('/tasks', authMiddleware, async (req, res) => { // normal get all tasks
//   try {
//     const tasks = await Task.find({ user: req.userId });
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get('/tasks', authMiddleware, async (req, res) => { // get tasks with pagination
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 5;

//     const skip = (page - 1) * limit;

//     const tasks = await Task.find({ user: req.userId })
//       .skip(skip)
//       .limit(limit);

//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.get('/tasks', authMiddleware, async (req, res) => { // get tasks with redis caching
  try {
    const cacheKey = `tasks:${req.userId}`;

    // 1. Check cache
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("⚡ Serving from REDIS");
      return res.json(JSON.parse(cached));
    }

    // 2. If not in cache → fetch from DB
    console.log("🐢 Serving from DB");
    const tasks = await Task.find({ user: req.userId });

    // 3. Store in cache
    await redisClient.set(cacheKey, JSON.stringify(tasks));

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tasks/:id', authMiddleware, async (req, res) => { // update task
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
     await redisClient.del(`tasks:${req.userId}`); // invalidate cache
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tasks/:id', authMiddleware, async (req, res) => { // delete task
  try {
    await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    await redisClient.del(`tasks:${req.userId}`); // invalidate cache
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// req- res cycle with middleware and Redis caching:
// Request hits server → middleware authenticates → route handler executes → Redis is checked 
// → DB is queried if needed → response is returned.

// Code	Meaning
// 200	Success
// 201	Created
// 400	Bad request
// 401	Unauthorized
// 404	Not found
// 500	Server error
// 504	Gateway timeout

// Path parameters are used to uniquely identify a resource, 
// while query parameters are used for filtering or optional data.