export const POST = async (req: Request) => {
  //   const response = await openai.chat.completions.create({
  //     model: 'gpt-3.5-turbo',
  //     temperature: 0,
  //     stream: true,
  //     messages: messages as any,
  //   })

  //   const stream = OpenAIStream(response, {
  //     onCompletion: async (completion: string) => {
  //       await db.message.create({
  //         data: {
  //           text: completion,
  //           isUserMessage: false,
  //           fileId,
  //           userId,
  //         },
  //       })
  //     },
  //   })

  //   return new StreamingTextResponse(stream)
  // }

  return new Response('Not found', { status: 404 })
}
