// This is a Netlify Function example using the Google Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Prompt is required' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        // Initialize Google Generative AI
        // Ensure GEMINI_API_KEY is set as an environment variable in Netlify
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Or "gemini-1.5-flash" etc.

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ tip: text }),
            headers: { 'Content-Type': 'application/json' },
        };

    } catch (error) {
        console.error('Error in Netlify Function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate tip', details: error.message }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
};