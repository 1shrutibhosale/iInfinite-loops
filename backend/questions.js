const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const subjects = require('../data/subjects');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Answer subject questions using AI
router.post('/ask', async (req, res) => {
    try {
        const { question, subject } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        // Build context from local data if subject is specified
        let context = '';
        if (subject && subjects[subject]) {
            const subjectData = subjects[subject];
            context = `You are an expert in ${subjectData.name}. Topics include: ${subjectData.topics.join(', ')}. `;
        }

        const systemPrompt = `${context}You are a helpful study buddy AI assistant. 
        Your job is to:
        1. Answer academic questions clearly and accurately
        2. Use simple language and examples
        3. Break down complex topics into digestible parts
        4. Provide relevant examples when helpful
        5. If you're not sure about something, say so
        
        Format your responses with clear structure using markdown when appropriate.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });

        res.json({
            answer: completion.choices[0].message.content,
            subject: subject || 'general'
        });

    } catch (error) {
        console.error('Error:', error);
        
        // Fallback to local data if AI fails
        if (error.code === 'insufficient_quota' || !process.env.OPENAI_API_KEY) {
            return res.json({
                answer: "I'm currently running in offline mode. Please check the concepts section for detailed explanations, or try a specific topic from the available subjects.",
                offline: true
            });
        }
        
        res.status(500).json({ error: 'Failed to get answer' });
    }
});

// Get available subjects
router.get('/subjects', (req, res) => {
    const subjectList = Object.entries(subjects).map(([key, value]) => ({
        id: key,
        name: value.name,
        topics: value.topics
    }));
    res.json(subjectList);
});

module.exports = router;
