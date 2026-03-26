const express = require('express');
const cors = require('cors');
require('dotenv').config();

const questionsRoute = require('./routes/questions');
const conceptsRoute = require('./routes/concepts');
const notesRoute = require('./routes/notes');
const quizRoute = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/questions', questionsRoute);
app.use('/api/concepts', conceptsRoute);
app.use('/api/notes', notesRoute);
app.use('/api/quiz', quizRoute);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Study Buddy API is running!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
