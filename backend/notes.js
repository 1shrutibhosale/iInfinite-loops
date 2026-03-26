const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const subjects = require('../data/subjects');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Generate notes/summary for a topic
router.post('/generate', async (req, res) => {
    try {
        const { topic, subject, format = 'notes' } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const formatInstructions = {
            notes: `Create comprehensive study notes with:
                - Clear headings and subheadings
                - Bullet points for key concepts
                - Important definitions highlighted
                - Examples where applicable
                - Memory tips/mnemonics`,
            summary: `Create a concise summary with:
                - Brief overview (2-3 sentences)
                - Main points (5-7 bullets)
                - Key takeaways
                - One practical example`,
            flashcards: `Create flashcard-style content with:
                - 5-8 question-answer pairs
                - Focus on key definitions and concepts
                - Include common exam questions`
        };

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an expert at creating study materials. ${formatInstructions[format]}
                    Use markdown formatting for better readability.`
                },
                {
                    role: "user",
                    content: `Create ${format} for: ${topic}${subject ? ` (${subjects[subject]?.name || subject})` : ''}`
                }
            ],
            max_tokens: 1500,
            temperature: 0.7
        });

        res.json({
            topic,
            format,
            content: completion.choices[0].message.content,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error:', error);
        
        // Fallback response
        if (error.code === 'insufficient_quota' || !process.env.OPENAI_API_KEY) {
            const { topic, subject } = req.body;
            
            // Try to generate from local data
            if (subject && subjects[subject]?.concepts) {
                const topicKey = topic.toLowerCase().replace(/\s+/g, '');
                const concept = subjects[subject].concepts[topicKey];
                
                if (concept) {
                    const localNotes = `# ${concept.title}\n\n## Overview\n${concept.explanation}\n\n## Key Points\n${concept.keyPoints.map(p => `- ${p}`).join('\n')}\n\n## Examples\n${concept.examples.map(e => `- ${e}`).join('\n')}`;
                    
                    return res.json({
                        topic,
                        format: 'notes',
                        content: localNotes,
                        generatedAt: new Date().toISOString(),
                        source: 'local'
                    });
                }
            }
            
            return res.json({
                topic,
                format: 'notes',
                content: "Notes generation is currently unavailable. Please try again later or browse the concepts section.",
                offline: true
            });
        }
        
        res.status(500).json({ error: 'Failed to generate notes' });
    }
});

// Generate summary from user's text
router.post('/summarize', async (req, res) => {
    try {
        const { text, length = 'medium' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const lengthConfig = {
            short: '2-3 sentences',
            medium: '1-2 paragraphs',
            long: '3-4 paragraphs with key points'
        };

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `Summarize the following text in ${lengthConfig[length]}. Focus on key concepts and important details.`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            max_tokens: 500,
            temperature: 0.5
        });

        res.json({
            summary: completion.choices[0].message.content,
            originalLength: text.length,
            summaryLength: completion.choices[0].message.content.length
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to summarize text' });
    }
});

module.exports = router;
