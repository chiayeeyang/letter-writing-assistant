import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { Message } from '../types.ts';

interface PromptConsoleProps {
  messages: Message[];
  onSendMessage: (promptText: string) => void;
  isGenerating: boolean;
  errorMessage: string | null;
}

const SAMPLE_PROMPTS = [
  {
    title: 'Featured Test Script: Design Grad Student Coffee Chat',
    badge: 'Your Testing Script',
    prompt:
      'I am a first year student in design grad school. I had missed a scheduled a coffee chat with someone a few years older, working in a role that I am interested in at a tech company. Draft me a 3-5 sentence apology letter letting them know that I am sorry but am still very open to chat with them if they are still interested.',
  },
  {
    title: 'Missed Due to Calendar/Time-Zone Confusion',
    badge: 'Scheduling Mixup',
    prompt:
      'I accidentally mixed up time zones for a 20-minute coffee chat with an engineering lead yesterday. I feel terrible and anxious. Can we draft a brief 3-sentence apology that takes full ownership, respects their calendar, and asks if they might have 15 minutes next week?',
  },
  {
    title: 'Delayed Apology (48 Hours Later)',
    badge: 'Delayed Follow-up',
    prompt:
      'I missed a networking chat two days ago because an urgent school deadline blew up, but I froze and didn’t email them right away because I felt so guilty. How do I address the delay without sounding like I am making excuses?',
  },
  {
    title: 'Overslept / Personal Error',
    badge: 'Total Ownership',
    prompt:
      'I completely overslept and missed an early morning coffee chat with a product manager who agreed to speak with me. I want an honest, humble apology that does not invent fake emergencies and lets them decline gracefully.',
  },
];

export const PromptConsole: React.FC<PromptConsoleProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  errorMessage,
}) => {
  const [input, setInput] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Live timer for user feedback during generation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectSample = (prompt: string) => {
    setInput(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      {/* Panel Top Header */}
      <div className="px-5 py-3.5 border-b border-stone-100 bg-stone-50/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-stone-600" />
          <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
            Agent Interaction
          </span>
        </div>
        <div className="text-[11px] text-stone-500 font-medium">
          {messages.length === 0 ? 'No active turns' : `${messages.length} message${messages.length === 1 ? '' : 's'}`}
        </div>
      </div>

      {/* Messages / Interaction History */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="py-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-100 text-stone-600 mx-auto">
              <Sparkles className="w-6 h-6 text-stone-500" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-semibold text-stone-900">
                Peer Career Advisor & Sounding Board
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                I'm here to help you navigate awkward networking mishaps without panic or over-apologizing.
                Tell me what happened, or click below to run your test prompt.
              </p>
            </div>

            {/* Quick Test Samples */}
            <div className="pt-2 text-left">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">
                Try a Scenario or Test Script
              </div>
              <div className="grid grid-cols-1 gap-2">
                {SAMPLE_PROMPTS.map((sample) => (
                  <button
                    key={sample.title}
                    type="button"
                    onClick={() => handleSelectSample(sample.prompt)}
                    className="p-3 text-left rounded-xl border border-stone-200/90 bg-stone-50/50 hover:bg-stone-100/80 hover:border-stone-300 transition-all group relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-medium text-stone-800 group-hover:text-stone-900">
                        {sample.title}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-700 font-medium">
                        {sample.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                      {sample.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-stone-900 text-stone-100 ml-6 shadow-2xs'
                    : 'bg-stone-100 text-stone-800 mr-6 border border-stone-200/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1 opacity-70 text-[10px] font-medium uppercase tracking-wider">
                  <span>{msg.role === 'user' ? 'You' : 'Baseline Agent'}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {msg.content}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="p-3.5 rounded-xl text-xs bg-stone-100 text-stone-600 mr-6 border border-stone-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-stone-400 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-stone-400 animate-pulse delay-150" />
                  <div className="w-2 h-2 rounded-full bg-stone-400 animate-pulse delay-300" />
                  <span className="text-xs text-stone-600 font-medium ml-1">
                    Peer Advisor drafting response...
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  {elapsedSeconds}s
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-rose-900">Service Notice</div>
              <p className="text-rose-800 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/70">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            id="letter-prompt-input"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder={
              messages.length === 0
                ? "Describe your situation (who you missed the chat with, their role/company, your desired tone & length)..."
                : "Ask for revisions (e.g., 'Make it 3 sentences', 'Soften the tone', 'Add a note about rescheduling')..."
            }
            className="w-full p-3 pr-12 text-xs text-stone-900 placeholder-stone-400 bg-white rounded-xl border border-stone-300 focus:outline-hidden focus:border-stone-500 focus:ring-1 focus:ring-stone-500 resize-none transition-all"
          />
          <button
            type="submit"
            id="submit-prompt-btn"
            disabled={!input.trim() || isGenerating}
            className="absolute right-2.5 bottom-3 p-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors disabled:opacity-30 disabled:hover:bg-stone-900"
            title="Send prompt (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-stone-400">
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3 text-stone-400" /> Enter to send • Shift+Enter for newline
          </span>
          <span>Model: gemini-3.6-flash</span>
        </div>
      </div>
    </div>
  );
};
