import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
} from "@google/generative-ai";
import { StreamingTextResponse, GoogleGenerativeAIStream } from "ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // Ask Google Generative AI for a streaming completion given the prompt
    const response = await genAI
      .getGenerativeModel({ model: "gemini-pro" })
      .generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

    // Convert the response into a friendly text-stream
    const stream = GoogleGenerativeAIStream(response);

    return new StreamingTextResponse(stream);
  } catch (error) {
    if (error instanceof GoogleGenerativeAIError) {
      const { name, message } = error;
      return NextResponse.json(
        {
          name,
          message,
        },
        { status: 500 }
      );
    } else {
      console.error("An unexpected error occurred:", error);
      throw error;
    }
  }
}
