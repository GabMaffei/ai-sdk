'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Bot, User2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ChatScrollToBottomButton } from './chat-scroll-to-bottom-button'
import { GithubProfile, GithubUser } from './github-profile'
import { Markdown } from './markdown'
import { MessageInput } from './message-input'
import { ToolLoading } from './tool-loading'

export function Chat() {
  // Controle do input do usuário (AGORA manual)
  const [input, setInput] = useState('')

  // Inicializa o hook useChat
  const {
    messages,
    status,
    error,
    sendMessage, // Para enviar msg do user
    regenerate, // Para forçar re-geração
    stop, // Para parar streaming
    clearError, // Para limpar erros, se quiser mostrar alerta
  } = useChat({
    // Novo padrão v5: transport full control
    transport: new DefaultChatTransport({
      api: '/api/ai', // Endpoint para o backend streaming AI
      // headers, body, credentials etc se desejar
    }),
    // onFinish, onToolCall etc vão aqui se quiser (opcional)
  })

  // Scroll helpers
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll automático ao receber msg nova
  useEffect(() => {
    if (containerRef.current && messages.length > 0 && status === 'streaming') {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, status])

  // Lidando com envio do input do usuário
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim()) return
    // v5: pode enviar tanto string quanto parts (neste caso texto puro)
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <>
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className="space-y-6 absolute inset-0 overflow-y-scroll scrollbar scrollbar-thumb-rounded-full scrollbar-thumb-zinc-900 scrollbar-track-transparent"
        >
          {/* Renderizando histórico de mensagens */}
          {messages.map(msg => (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="size-7 rounded-md bg-zinc-900 flex items-center justify-center">
                {msg.role === 'user' ? (
                  <User2 className="size-4 text-zinc-100" />
                ) : (
                  <Bot className="size-4 text-zinc-400" />
                )}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex-1 prose prose-invert prose-zinc prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs">
                  {/* Loop único para renderizar todas as partes da mensagem */}
                  {msg.parts.map((part, index) => {
                    // Usando um switch para melhor organização
                    switch (part.type) {
                      case 'text':
                        // Para renderizar texto, você pode usar seu componente Markdown ou um simples <span>
                        // biome-ignore lint/suspicious/noArrayIndexKey: bug
                        return <Markdown key={index}>{part.text}</Markdown>

                      case 'tool-githubProfile':
                        // Lógica para renderizar a UI da ferramenta
                        switch (part.state) {
                          case 'input-available':
                            return (
                              <ToolLoading
                                key={part.toolCallId}
                                text="Carregando informações do Github..."
                              />
                            )
                          case 'output-available':
                            return (
                              <GithubProfile
                                key={part.toolCallId}
                                user={part.output as GithubUser}
                              />
                            )
                          case 'output-error':
                            return (
                              <div key={part.toolCallId}>
                                Erro: {part.errorText}
                              </div>
                            )
                          default:
                            return null
                        }

                      case 'tool-fetchHTTP':
                        // Lógica para renderizar a UI da ferramenta
                        switch (part.state) {
                          case 'input-available':
                            return (
                              <ToolLoading
                                key={part.toolCallId}
                                text="Realizando requisição HTTP..."
                              />
                            )
                          //   case 'output-available':
                          //     return (
                          //       <div key={part.toolCallId} className="w-full">
                          //         {/* Usando <pre> para formatar bem o JSON */}
                          //         <pre className="text-xs bg-zinc-800 p-2 rounded-md overflow-x-auto">
                          //           {JSON.stringify(part.output, null, 2)}
                          //         </pre>
                          //       </div>
                          //     )
                          case 'output-error':
                            return (
                              <div key={part.toolCallId}>
                                Erro: {part.errorText}
                              </div>
                            )
                          default:
                            return null
                        }

                      // Você pode adicionar outros `case` aqui para outras ferramentas
                      // case 'tool-fetchHTTP':
                      //   // ...

                      default:
                        return null
                    }
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <ChatScrollToBottomButton
          containerRef={containerRef}
          scrollRef={bottomRef}
        />
      </div>
      {/* Campo de input/controlado manualmente */}
      <MessageInput
        value={input}
        onValueChange={setInput}
        onSubmit={handleSubmit}
        disabled={status === 'streaming'}
        error={error ? String(error.message) : undefined}
      />
    </>
  )
}
