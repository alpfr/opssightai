const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateContent(transcription) {
    try {
        console.log("Starting content generation...");

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful and creative ministry assistant. Your goal is to help a pastor take their sermon transcription and repurpose it for social media and small groups.
                    
                    You must output a valid JSON object with the following structure:
                    {
                        "summary": "A concise, engaging newsletter summary of the sermon (approx 3-4 sentences).",
                        "tweets": ["Tweet 1 (max 280 chars)", "Tweet 2", "Tweet 3"],
                        "questions": ["Discussion Question 1", "Discussion Question 2", "Discussion Question 3", "Discussion Question 4", "Discussion Question 5"]
                    }
                    
                    Do not include markdown formatting like \`\`\`json at the start or end. Just return the raw JSON string.`
                },
                {
                    role: "user",
                    content: `Here is the sermon transcription. Please generate the assets.\n\n${transcription}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = JSON.parse(completion.choices[0].message.content);
        console.log("Content generation successful");
        return content;

    } catch (error) {
        console.error("Error in contentGenService:", error);
        throw error;
    }
}

module.exports = { generateContent };
