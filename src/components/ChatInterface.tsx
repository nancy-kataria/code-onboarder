import { useState, useRef, useEffect } from "react";
import { Send, FileCode, Sparkles, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

let messageCounter = 0;
const generateMessageId = () => `msg-${Date.now()}-${++messageCounter}`;

interface Source {
  file: string;
  lines: string;
  url: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  repoUrl: string;
}

const mockResponses: { query: string; response: string; sources: Source[] }[] = [
  {
    query: "how does authentication work",
    response: "The authentication system uses JWT tokens with a middleware-based approach. When a user logs in, the `AuthController` validates credentials against the database and issues a signed JWT token. This token is then verified by the `authMiddleware` on protected routes. The token includes user ID and roles for authorization checks.",
    sources: [
      { file: "src/middleware/auth.ts", lines: "15-45", url: "#" },
      { file: "src/controllers/AuthController.ts", lines: "23-67", url: "#" },
    ],
  },
  {
    query: "explain the database schema",
    response: "The database follows a relational model with PostgreSQL. Core entities include `users`, `projects`, `files`, and `embeddings`. The `users` table connects to `projects` via a many-to-many relationship through `project_members`. Each project contains multiple files, and each file can have multiple embedding vectors stored in the `embeddings` table for semantic search.",
    sources: [
      { file: "prisma/schema.prisma", lines: "1-89", url: "#" },
      { file: "src/models/index.ts", lines: "5-42", url: "#" },
    ],
  },
];

const ChatInterface = ({ repoUrl }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I've analyzed your codebase and I'm ready to help. Ask me anything about the architecture, specific functions, or how different parts connect.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateStreaming = async (text: string, sources: Source[]) => {
    // Prevent double execution
    if (streamingRef.current) return;
    streamingRef.current = true;

    const messageId = generateMessageId();
    setMessages((prev) => [
      ...prev,
      { id: messageId, role: "assistant", content: "", isStreaming: true },
    ]);

    // Simulate word-by-word streaming
    const words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 40));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: words.slice(0, i + 1).join(" ") }
            : msg
        )
      );
    }

    // Add sources after streaming completes
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isStreaming: false, sources }
          : msg
      )
    );
    setIsLoading(false);
    streamingRef.current = false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Find matching mock response or use default
    const matchedResponse = mockResponses.find((r) =>
      input.toLowerCase().includes(r.query)
    ) || {
      response: "Based on my analysis of the codebase, I can see this is related to the core application logic. The implementation follows standard patterns with clear separation of concerns. Would you like me to dive deeper into any specific aspect?",
      sources: [
        { file: "src/index.ts", lines: "1-25", url: "#" },
      ],
    };

    await simulateStreaming(matchedResponse.response, matchedResponse.sources);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const repoName = repoUrl.split("/").slice(-2).join("/").replace(".git", "");

  return (
    <div className="flex flex-col h-[600px] bg-card border border-border rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Intelligence Hub</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">{repoName}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-slide-up ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] ${
                message.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
              } px-4 py-3`}
            >
              <p className="text-sm leading-relaxed">
                {message.content}
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-primary animate-typing" />
                )}
              </p>

              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <FileCode className="w-3 h-3" />
                    Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {message.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-badge group"
                      >
                        <FileCode className="w-3 h-3" />
                        <span>{source.file}</span>
                        <span className="text-muted-foreground">:{source.lines}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-secondary/30">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the codebase..."
            className="flex-1 min-h-[48px] max-h-32 resize-none bg-input border-border focus:border-primary focus:ring-primary/20"
            rows={1}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
};

export default ChatInterface;
