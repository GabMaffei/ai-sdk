'use client'
import { Send } from 'lucide-react'
import { type KeyboardEvent, useEffect, useId, useRef } from 'react'

interface MessageInputProps {
  value: string
  onValueChange: (val: string) => void
  onSubmit: () => void
  disabled: boolean
  error?: string
}

export function MessageInput({
  value,
  onValueChange,
  onSubmit,
  disabled,
  error,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const textareaId = useId()

  // Permite enviar com Ctrl+Enter ou Cmd+Enter
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      onSubmit()
    }
  }

  // Foco automático sempre que habilitado
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus()
    }
  }, [disabled])

  // Importante: converte evento pra string!
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onValueChange(e.target.value)
  }

  // Previna submit padrão e chame prop
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full max-w-3xl flex flex-col items-center gap-3"
    >
      <div className="w-full bg-zinc-950 border rounded-lg border-zinc-900 p-4 focus-within:border-zinc-800">
        <textarea
          name="message"
          id={textareaId}
          placeholder="Ask something..."
          className="w-full resize-none min-h-16 outline-none disabled:opacity-50"
          value={value}
          onChange={handleChange} // <----- aqui faz o bridge evento->string!
          onKeyDown={handleKeyDown}
          disabled={disabled}
          ref={textareaRef}
          // biome-ignore lint/a11y/noAutofocus: <explanation>
          autoFocus
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="px-3 py-1.5 text-sm rounded-md flex items-center gap-2 bg-white text-black font-medium cursor-pointer hover:opacity-80 disabled:opacity-50"
          >
            Send
            <Send className="size-3" />
          </button>
        </div>
      </div>
      {error && (
        <div className="text-red-400 px-2 text-xs w-full text-left">
          {error}
        </div>
      )}
      <span className="text-xs text-zinc-600">
        Press <span className="text-zinc-500">⌘ + Enter</span> to send message.
      </span>
    </form>
  )
}
