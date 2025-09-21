import { openai } from '@ai-sdk/openai'
import { convertToModelMessages, stepCountIs, streamText } from 'ai'
import type { NextRequest } from 'next/server'
import { tools } from '@/ai/tools'
// import { openrouter } from '@/ai/open-router'

export async function POST(request: NextRequest) {
  const { messages } = await request.json()

  const modelMessages = convertToModelMessages(messages)

  const result = await streamText({
    model: openai('gpt-5'), // ou 'openai/gpt-4o' //openrouter('openai/gpt-4o'),
    tools,
    messages: modelMessages,
    system:
      'Sempre responda em markdown sem aspas no inicio e fim da mensagem.',
    stopWhen: stepCountIs(5),
    onStepFinish({ toolResults }) {
      console.log('TOOL RESULTS:', toolResults)
    },
  })

  return result.toUIMessageStreamResponse()
}
