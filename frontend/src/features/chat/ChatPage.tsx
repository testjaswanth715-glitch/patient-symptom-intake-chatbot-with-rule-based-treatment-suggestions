import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, AlertCircle, RefreshCw, Heart, Activity } from 'lucide-react';
import { type ChatMessage } from './types';
import { INTAKE_PROMPT } from './intakePrompt';
import { useTreatmentMutation } from './useTreatmentMutation';
import { applyGuardrails, detectRedFlags, getRedFlagGuidance } from '../../lib/medicalGuardrails';
import { toast } from 'sonner';

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: INTAKE_PROMPT,
      timestamp: new Date(),
      status: 'sent'
    }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const treatmentMutation = useTreatmentMutation();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) {
      toast.error('Please enter your symptoms before sending.');
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Check for red flags
    const hasRedFlags = detectRedFlags(trimmedInput);

    if (hasRedFlags) {
      // Show urgent care message immediately
      const urgentMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: getRedFlagGuidance(),
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages(prev => [...prev, urgentMessage]);
      return;
    }

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, loadingMessage]);

    // Call backend
    try {
      const response = await treatmentMutation.mutateAsync(trimmedInput);
      const enhancedResponse = applyGuardrails(trimmedInput, response);

      // Replace loading message with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: enhancedResponse,
                status: 'sent' as const
              }
            : msg
        )
      );
    } catch (error) {
      // Replace loading message with error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: 'I apologize, but I encountered an error processing your request. Please try again.',
                status: 'error' as const
              }
            : msg
        )
      );
      
      toast.error('Failed to get treatment guidance. Please try again.');
    }
  };

  const handleRetry = async (messageId: string) => {
    // Find the user message before this error message
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex <= 0) return;

    const userMessage = messages[messageIndex - 1];
    if (userMessage.role !== 'user') return;

    // Update error message to loading
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, status: 'sending' as const, content: '' }
          : msg
      )
    );

    // Retry the request
    try {
      const response = await treatmentMutation.mutateAsync(userMessage.content);
      const enhancedResponse = applyGuardrails(userMessage.content, response);

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                content: enhancedResponse,
                status: 'sent' as const
              }
            : msg
        )
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                content: 'I apologize, but I encountered an error processing your request. Please try again.',
                status: 'error' as const
              }
            : msg
        )
      );
      
      toast.error('Failed to get treatment guidance. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Medical Assistant</h1>
              <p className="text-sm text-muted-foreground">Symptom analysis & treatment guidance</p>
            </div>
          </div>
        </div>
      </header>

      {/* Disclaimer Banner */}
      <div className="border-b bg-accent/30">
        <div className="container mx-auto px-4 py-3">
          <Alert className="border-0 bg-transparent p-0">
            <AlertCircle className="h-4 w-4 text-accent-foreground" />
            <AlertDescription className="text-sm text-accent-foreground ml-2">
              <strong>Important:</strong> This tool provides general information only and is not a substitute for professional medical advice, diagnosis, or treatment.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full max-w-4xl px-4 py-6">
          <ScrollArea className="h-full pr-4" ref={scrollRef}>
            <div className="space-y-6 pb-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                        : 'bg-card border rounded-2xl rounded-tl-sm shadow-soft'
                    } px-5 py-4`}
                  >
                    {message.status === 'sending' ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    ) : (
                      <>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {message.content.split('\n').map((line, i) => {
                            // Handle bold markdown
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <p key={i} className={i > 0 ? 'mt-3' : ''}>
                                {parts.map((part, j) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                                  }
                                  return <span key={j}>{part}</span>;
                                })}
                              </p>
                            );
                          })}
                        </div>
                        {message.status === 'error' && (
                          <div className="mt-3 pt-3 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetry(message.id)}
                              className="gap-2"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Retry
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                    <div className="mt-2 text-xs opacity-60">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t bg-card shadow-lg">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <Card className="border-2 focus-within:border-primary transition-colors">
            <div className="flex gap-3 p-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the symptoms you're experiencing..."
                className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={treatmentMutation.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || treatmentMutation.isPending}
                size="icon"
                className="shrink-0 h-[60px] w-[60px] rounded-lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </Card>
          <div className="mt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            © 2026. Built with <Heart className="w-3 h-3 text-destructive fill-destructive" /> using{' '}
            <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
