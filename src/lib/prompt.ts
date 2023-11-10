import 'server-only'
import { Message } from '@prisma/client'

function approximateTokenCount(text: string) {
  // Splitting the text by spaces and punctuation for a rough approximation
  const tokens = text.match(/\w+|\s+|[^\s\w]+/g) || []
  return tokens.length
}

export function buildPrompt({
  message,
  previousMessages,
  context,
}: {
  message: string
  previousMessages: Message[]
  context: string[]
}) {
  const systemMessage = {
    role: 'system',
    content: `
    Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    `,
  }

  const previousConversation = {
    role: 'system',
    content: `
    PREVIOUS CONVERSATION:
    ${previousMessages
      .map((message) =>
        message.isUserMessage
          ? `User: ${message.text}`
          : `Assistant: ${message.text}`
      )
      .join('\n')}
    `,
  }

  const contextSection = {
    role: 'system',
    content: context.join('\n'),
  }

  const userInput = {
    role: 'user',
    content: `USER INPUT: ${message}`,
  }

  const prompt = {
    systemMessage,
    previousConversation,
    contextSection,
    userInput,
  }

  while (approximateTokenCount(JSON.stringify(Object.values(prompt))) > 4000) {
    prompt.contextSection.content = prompt.contextSection.content
      .split('\n')
      .slice(0, -1)
      .join('\n')
  }

  return Object.values(prompt)
}
