'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ConversationMessage } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle } from 'lucide-react';

interface PortalSupportChatProps {
  clientId: string;
  conversationId: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHr < 24) return `il y a ${diffHr}h`;
  if (diffDay < 7) return `il y a ${diffDay}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function PortalSupportChat({
  clientId,
  conversationId,
}: PortalSupportChatProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch messages + realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('messages')
        .eq('id', conversationId)
        .single();

      if (!error && data?.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          if (
            payload.new &&
            typeof payload.new === 'object' &&
            'messages' in payload.new
          ) {
            const newMessages = (payload.new as { messages?: unknown }).messages;
            if (Array.isArray(newMessages)) {
              setMessages(newMessages);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, supabase]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    try {
      const newMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        sender_id: clientId,
        sender_role: 'client',
        content: inputValue,
        timestamp: new Date().toISOString(),
      };

      const { data: conversation } = await supabase
        .from('conversations')
        .select('messages')
        .eq('id', conversationId)
        .single();

      const currentMessages = Array.isArray(conversation?.messages)
        ? conversation.messages
        : [];

      const { error } = await supabase
        .from('conversations')
        .update({
          messages: [...currentMessages, newMessage],
        })
        .eq('id', conversationId);

      if (error) throw error;

      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border bg-background overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <MessageCircle className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Aucun message pour le moment
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Posez une question ou partagez un retour avec notre équipe
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.sender_role === 'client';
            const roleLabel =
              message.sender_role === 'client'
                ? 'Vous'
                : 'Équipe';

            return (
              <div
                key={message.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}
                >
                  {!isMe && (
                    <p className="text-[10px] font-semibold mb-0.5 opacity-70">
                      {roleLabel}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe
                        ? 'text-primary-foreground/60'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {timeAgo(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-muted/20">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Écrivez votre message..."
            className="min-h-10 max-h-24 resize-none text-sm rounded-xl"
            disabled={isLoading}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            size="icon"
            className="h-10 w-10 rounded-xl flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Entrée pour envoyer, Maj+Entrée pour un saut de ligne
        </p>
      </div>
    </div>
  );
}
