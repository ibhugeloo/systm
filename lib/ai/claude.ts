import Anthropic from '@anthropic-ai/sdk';

let claudeClientInstance: Anthropic | null = null;

function getClaudeClient(): Anthropic {
  if (claudeClientInstance) {
    return claudeClientInstance;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  claudeClientInstance = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  return claudeClientInstance;
}

export async function streamClaude(
  systemPrompt: string,
  userMessage: string
): Promise<ReadableStream<string>> {
  const client = getClaudeClient();

  const stream = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
    stream: true,
  });

  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(event.delta.text);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const client = getClaudeClient();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  throw new Error('Unexpected response type from Claude');
}
