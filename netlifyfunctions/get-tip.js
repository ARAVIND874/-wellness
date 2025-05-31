// This is a Netlify Function example using the Google Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event, context) => {
    // Netlify Function துவங்கும் நேரம்
    console.log('Netlify Function started at:', new Date().toISOString());

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        console.log('Method not allowed:', event.httpMethod);
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        console.log('Received prompt:', prompt); // உள்வரும் ப்ராம்ப்ட்டைப் பதிவு செய்கிறோம்

        if (!prompt) {
            console.log('Error: Prompt is required');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Prompt is required' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        // 1. GEMINI_API_KEY environment variable ஐ அணுகி பதிவு செய்கிறோம்
        const API_KEY = process.env.GEMINI_API_KEY;
        console.log('Attempting to access API Key. Key presence:', !!API_KEY); // API Key உள்ளதா இல்லையா என்பதைக் காட்டுகிறது (true/false)
        // Production சூழலில் API Key ஐ நேரடியாக பதிவு செய்ய வேண்டாம்!
        // இது வெறும் பிழைத்திருத்தத்திற்காக மட்டுமே.
        // console.log('API Key (first 5 chars):', API_KEY ? API_KEY.substring(0, 5) + '...' : 'Not Found'); 

        // 2. API Key இல்லையெனில் ஒரு பிழையை வழங்குகிறோம்
        if (!API_KEY) {
            console.error('CRITICAL ERROR: GEMINI_API_KEY is not set as an environment variable in Netlify!');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error: Gemini API Key is missing. Please contact support.' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        // Initialize Google Generative AI
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Or "gemini-1.5-flash" etc.

        console.log('Calling Gemini API with model:', "gemini-pro");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('Gemini API call successful. Generated text length:', text.length);

        return {
            statusCode: 200,
            body: JSON.stringify({ tip: text }),
            headers: { 'Content-Type': 'application/json' },
        };

    } catch (error) {
        console.error('Error in Netlify Function:', error); // முழு பிழைப் பொருளைப் பதிவு செய்கிறோம்
        console.error('Error message:', error.message); // பிழைச் செய்தியைப் பதிவு செய்கிறோம்
        // ஒருவேளை இது API Key சம்பந்தமான பிழையாக இருந்தால், அதன் செய்தி இங்கு வரலாம்.
        if (error.message && error.message.includes('API key not valid')) {
            console.error('Likely API Key validation error from Google Gemini.');
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate tip', details: error.message }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
};
