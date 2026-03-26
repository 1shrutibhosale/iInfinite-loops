const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const subjects = require('../data/subjects');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Get concept explanation
router.post('/explain', async (req, res) => {
    try {
        const { topic, subject, difficulty = 'simple' } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        // Check local data first
        if (subject && subjects[subject]?.concepts) {
            const topicKey = topic.toLowerCase().replace(/\s+/g, '');
            const localConcept = subjects[subject].concepts[topicKey];
            
            if (localConcept) {
                return res.json({
                    title: localConcept.title,
                    explanation: localConcept.explanation,
                    keyPoints: localConcept.keyPoints,
                    examples: localConcept.examples,
                    source: 'local'
                });
            }
        }

        // Use AI for explanation
        const difficultyPrompts = {
            simple: "Explain like I'm a beginner. Use simple words and everyday analogies.",
            intermediate: "Explain with moderate technical detail, assuming basic knowledge.",
            advanced: "Provide a comprehensive technical explanation with edge cases."
        };

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an expert teacher. ${difficultyPrompts[difficulty]}
                    Structure your response as JSON with:
                    - title: the topic name
                    - explanation: main explanation (2-3 paragraphs)
                    - keyPoints: array of 4-5 key points
                    - examples: array of 1-2 practical examples`
                },
                {
                    role: "user",
                    content: `Explain: ${topic}${subject ? ` in the context of ${subjects[subject]?.name || subject}` : ''}`
                }
            ],
            max_tokens: 800,
            temperature: 0.7
        });

        const content = completion.choices[0].message.content;
        
        // Try to parse as JSON, fallback to text
        try {
            const parsed = JSON.parse(content);
            res.json({ ...parsed, source: 'ai' });
        } catch {
            res.json({
                title: topic,
                explanation: content,
                keyPoints: [],
                examples: [],
                source: 'ai'
            });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get explanation' });
    }
});

// Get all concepts for a subject
router.get('/subject/:subjectId', (req, res) => {
    const { subjectId } = req.params;
    
    if (!subjects[subjectId]) {
        return res.status(404).json({ error: 'Subject not found' });
    }

    const conceptList = Object.entries(subjects[subjectId].concepts || {}).map(([key, value]) => ({
        id: key,
        title: value.title,
        preview: value.explanation.substring(0, 100) + '...'
    }));

    res.json({
        subject: subjects[subjectId].name,
        concepts: conceptList
    });
});

module.exports = router;
