import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { MessageThread, Message } from '@/lib/api/types';
import { useAuth } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/cn';

function getThreadContext(thread: MessageThread): string {
  if (thread.application) return `Application: ${thread.application.opportunity?.title ?? 'Opportunity'}`;
  if (thread.joinRequest) return `Join Request: ${thread.joinRequest.startup?.name ?? 'Startup'}`;
  return 'Message Thread';
}

export default function ThreadPage(): JSX.Element {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState('');

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['messages', 'thread', threadId],
    queryFn: async () => {
      const res = await api.get<MessageThread>(endpoints.messages.thread(threadId!));
      return res.data;
    },
    enabled: !!threadId,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', 'thread', threadId, 'messages'],
    queryFn: async () => {
      const res = await api.get<{ data?: Message[] } | Message[]>(
        endpoints.messages.threadMessages(threadId!),
      );
      const body = res.data;
      const list = (body && typeof body === 'object' && 'data' in body ? body.data : body) ?? [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!threadId,
    refetchInterval: 10_000,
  });

  const sendMutation = useMutation({
    mutationFn: async (payload: { content: string }) => {
      await api.post(endpoints.messages.sendMessage(threadId!), payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'thread', threadId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'threads'] });
      setContent('');
    },
  });

  const messages = messagesData ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate({ content: trimmed });
  };

  useEffect(() => {
    if (!threadId) navigate('/messages');
  }, [threadId, navigate]);

  if (!threadId) return null;

  if (threadLoading || !thread) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/messages')}
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← Back
        </button>
        <h1 className="ef-heading-gradient text-2xl font-semibold leading-tight md:text-3xl">
          {getThreadContext(thread)}
        </h1>
      </header>

      <div className="flex flex-1 flex-col rounded-2xl border border-white/10 bg-black/45">
        <div className="flex max-h-[400px] min-h-[200px] flex-1 flex-col overflow-y-auto p-4 space-y-4">
          {messagesLoading ? (
            <div className="flex flex-1 items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">No messages yet. Start the conversation.</p>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={isOwn ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={cn(
                      'flex max-w-[80%] gap-2',
                      isOwn && 'flex-row-reverse',
                    )}
                  >
                    <Avatar
                      name={isOwn ? 'You' : 'User'}
                      size="sm"
                      className="shrink-0"
                    />
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2',
                        isOwn
                          ? 'bg-white/15 text-zinc-100'
                          : 'bg-white/5 text-zinc-200',
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex gap-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message..."
              className="min-h-[44px] flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              variant="primary"
              withBorderEffect={false}
              onClick={handleSend}
              disabled={!content.trim() || sendMutation.isPending}
              className="self-end"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
