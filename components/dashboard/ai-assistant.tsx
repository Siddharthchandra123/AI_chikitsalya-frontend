"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  X,
  Send,
  Sparkles,
  FileSearch,
  Pill,
  Clock,
  CalendarClock,
  MessageCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const suggestedPrompts = [
  { icon: FileSearch, text: "Explain MRI report" },
  { icon: Pill, text: "Which medicines continue?" },
  { icon: Clock, text: "What is pending for discharge?" },
  { icon: CalendarClock, text: "Next follow-up date?" },
]

const mockMessages = [
  {
    role: "assistant",
    content:
      "Hello! I'm your AI health assistant. I can help you understand your medical reports, prescriptions, and discharge process. What would you like to know?",
  },
]

interface AIAssistantProps {
  isOpen: boolean
  onToggle: () => void
}

export function AIAssistant({ isOpen, onToggle }: AIAssistantProps) {
  const [messages, setMessages] = useState(mockMessages)
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    
    setMessages([
      ...messages,
      { role: "user", content: input },
      {
        role: "assistant",
        content:
          "I understand you're asking about your health records. Based on your reports, everything looks good. Your MRI scan shows minor observations that Dr. Priya will discuss during your follow-up on May 15th. Would you like me to explain anything specific?",
      },
    ])
    setInput("")
  }

  const handlePromptClick = (prompt: string) => {
    setMessages([
      ...messages,
      { role: "user", content: prompt },
      {
        role: "assistant",
        content: `Great question! Let me analyze your ${prompt.toLowerCase()}. Based on your records, I can provide a detailed explanation. Is there anything specific you'd like to know more about?`,
      },
    ])
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-xl flex items-center justify-center z-50"
          >
            <Bot className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[380px] max-h-[600px] z-50"
          >
            <Card className="border-0 shadow-2xl overflow-hidden glass">
              {/* Header */}
              <CardHeader className="p-4 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Health Assistant</h3>
                      <p className="text-xs text-primary-foreground/80">
                        Always here to help
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onToggle}
                    className="text-primary-foreground hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0 flex flex-col h-[450px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] p-3 rounded-2xl text-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium text-primary">
                              AI Assistant
                            </span>
                          </div>
                        )}
                        {message.content}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Suggested Prompts */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Suggested questions:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestedPrompts.map((prompt) => (
                        <button
                          key={prompt.text}
                          onClick={() => handlePromptClick(prompt.text)}
                          className="flex items-center gap-2 p-2 text-xs text-left rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <prompt.icon className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">{prompt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Ask anything about your health..."
                      className="flex-1 bg-muted border-0"
                    />
                    <Button size="icon" onClick={handleSend}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

