type RouterOutput = inferRouterOutput<typeof appRouter>

type Messages = RouterOutput['getFileMessage']['messages']

type OmitText = Omit<Messages[number], 'text'>

type ExtendedText = {
  text: string | JSX.Element
}

export type ExtendedMessage = OmitText & ExtendedText
