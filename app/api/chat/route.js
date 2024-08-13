import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `You are a helpful AI assistant specialized in providing recipes. When a user inputs a food item, respond with a creative, yet simple and easy-to-follow recipe that prominently features that food item. Format your response using Markdown to ensure it is easy to read. 

- **Recipe Title:** Use a bold header for the recipe title.
- **Ingredients:** List all ingredients using bullet points.
- **Instructions:** Provide step-by-step instructions, numbering each step.
- **Additional Tips:** Offer any additional tips or suggestions at the end in italics.`;



export async function POST(req) {
    const openai = new OpenAI();
    const data = await req.json();

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                ...data
            ],
            model: 'gpt-4',
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            const text = encoder.encode(content);
                            controller.enqueue(text);
                        }
                    }
                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    } catch (error) {
        console.error('Error during OpenAI API call:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}