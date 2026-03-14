const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const ORCHESTRA_SYSTEM_PROMPT = `You are Orchestra, an AI coding assistant embedded inside a VS Code clone. You help developers understand, refactor, debug, test, and optimize their code.

You have awareness of the file the developer currently has open. When they ask about code, assume they are referring to their active file unless they specify otherwise.

Response rules:
- Keep responses concise and developer-focused
- When providing code, always specify the language
- Use technical precision - this audience is engineers
- Do not add unnecessary preamble ("Great question!", "Sure!", etc.)
- Format code blocks with triple backticks and language identifier
- If suggesting a fix, explain WHY briefly before showing the code
- Max 3 bullet points when listing things - developers want signal not noise
- If asked something outside coding (politics, general chat etc.) redirect: "I'm focused on your codebase. What can I help you build?"`;

export async function sendMessage(messages, activeFile = null, fileContext = '') {
  if (!API_KEY) {
    throw new Error('No API key found. Add VITE_GROQ_API_KEY to your .env file.');
  }

  const systemWithContext = activeFile
    ? `${ORCHESTRA_SYSTEM_PROMPT}\n\nThe developer currently has ${activeFile} open.${fileContext}`
    : ORCHESTRA_SYSTEM_PROMPT;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemWithContext },
        ...messages.map((message) => ({
          role: message.role === 'agent' ? 'assistant' : 'user',
          content: message.content,
        })),
      ],
    }),
  });

  if (response.status === 401) {
    throw new Error('Invalid API key. Check VITE_GROQ_API_KEY in your .env file.');
  }

  if (response.status === 429) {
    throw new Error('Rate limited. Wait a moment and try again.');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}
