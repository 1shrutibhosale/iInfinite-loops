const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const subjects = require('../data/subjects');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Get quiz for a subject (uses local data)
router.get('/subject/:subjectId', (req, res) => {
    const { subjectId } = req.params;
    const { count = 5 } = req.query;

    if (!subjects[subjectId]) {
        return res.status(404).json({ error: 'Subject not found' });
    }

    const allQuestions = subjects[subjectId].quizQuestions || [];
    
    // Shuffle and limit questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(parseInt(count), shuffled.length));

    // Remove correct answer from response (client will verify)
    const questions = selected.map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        _correct: q.correct, // Will be used for verification
        _explanation: q.explanation
    }));

    res.json({
        subject: subjects[subjectId].name,
        totalQuestions: questions.length,
        questions: questions.map(({ _correct, _explanation, ...q }) => q),
        // Store answers server-side (in real app, use sessions/tokens)
        _answers: questions.map(q => ({ id: q.id, correct: q._correct, explanation: q._explanation }))
    });
});

// Generate custom quiz using AI
router.post('/generate', async (req, res) => {
    try {
        const { topic, subject, count = 5, difficulty = 'medium' } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const difficultyGuide = {
            easy: 'basic recall and simple concepts',
            medium: 'understanding and application',
            hard: 'analysis, edge cases, and tricky scenarios'
        };

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `Generate ${count} multiple choice quiz questions about "${topic}".
                    Difficulty: ${difficultyGuide[difficulty]}
                    
                    Return JSON array with objects containing:
                    - question: the question text
                    - options: array of 4 options
                    - correct: index of correct option (0-3)
                    - explanation: brief explanation of the answer
                    
                    Make questions educational and clear.`
                },
                {
                    role: "user",
                    content: `Generate quiz for: ${topic}${subject ? ` in ${subjects[subject]?.name || subject}` : ''}`
                }
            ],
            max_tokens: 1500,
            temperature: 0.8
        });

        let questions;
        try {
            questions = JSON.parse(completion.choices[0].message.content);
        } catch {
            // Try to extract JSON from response
            const match = completion.choices[0].message.content.match(/\[[\s\S]*\]/);
            if (match) {
                questions = JSON.parse(match[0]);
            } else {
                throw new Error('Failed to parse quiz questions');
            }
        }

        const formattedQuestions = questions.map((q, index) => ({
            id: index + 1,
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation
        }));

        res.json({
            topic,
            difficulty,
            totalQuestions: formattedQuestions.length,
            questions: formattedQuestions
        });

    } catch (error) {
        console.error('Error:', error);
        
        // Fallback to local questions if available
        if (req.body.subject && subjects[req.body.subject]) {
            const localQuestions = subjects[req.body.subject].quizQuestions || [];
            if (localQuestions.length > 0) {
                const shuffled = [...localQuestions].sort(() => Math.random() - 0.5);
                return res.json({
                    topic: req.body.topic,
                    difficulty: req.body.difficulty || 'medium',
                    totalQuestions: Math.min(5, shuffled.length),
                    questions: shuffled.slice(0, 5).map((q, i) => ({
                        id: i + 1,
                        ...q
                    })),
                    source: 'local'
                });
            }
        }
        
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// Verify quiz answers
router.post('/verify', (req, res) => {
    const { answers, questions } = req.body;

    if (!answers || !questions) {
        return res.status(400).json({ error: 'Answers and questions are required' });
    }

    let correct = 0;
    const results = answers.map((answer, index) => {
        const question = questions[index];
        const isCorrect = answer === question.correct;
        if (isCorrect) correct++;
        
        return {
            questionId: index + 1,
            userAnswer: answer,
            correctAnswer: question.correct,
            isCorrect,
            explanation: question.explanation
        };
    });

    const score = Math.round((correct / questions.length) * 100);

    res.json({
        totalQuestions: questions.length,
        correctAnswers: correct,
        score,
        grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
        results
    });
});

module.exports = router;
