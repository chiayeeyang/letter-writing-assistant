import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { PromptConsole } from './components/PromptConsole.tsx';
import { LetterDocument } from './components/LetterDocument.tsx';
import { DeploymentGuideModal } from './components/DeploymentGuideModal.tsx';
import { Message } from './types.ts';
import { extractCleanEmailDraft } from './utils/draftExtractor.ts';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentDraft, setCurrentDraft] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);

  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isGenerating) return;

    setErrorMessage(null);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptText,
          history: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate letter response.');
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.text || '',
        timestamp: new Date().toISOString(),
      };

      setMessages([...newHistory, assistantMsg]);

      // In the right-side "Advisor Workspace" panel, only show the email content itself
      // Never show mentor commentary, conversation, or headers alongside it
      const cleanEmail = extractCleanEmailDraft(data.emailDraft || data.text || '');
      if (cleanEmail) {
        setCurrentDraft(cleanEmail);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMessage(
        err?.message || 'Something went wrong while communicating with Gemini.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewLetter = () => {
    setMessages([]);
    setCurrentDraft('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans antialiased">
      <Header
        onNewLetter={handleNewLetter}
        onOpenDeploymentGuide={() => setIsDeployModalOpen(true)}
        isGenerating={isGenerating}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Peer Career Advisor Status Bar */}
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              <strong>Peer Career Advisor Active:</strong> Ready to act as a sounding board, reassure, and draft authentic apology & networking emails.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDeployModalOpen(true)}
            className="text-emerald-900 font-semibold underline underline-offset-2 hover:text-emerald-950 text-left sm:text-right"
          >
            Vercel deployment setup &rarr;
          </button>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
          {/* Left Column: Interaction & Baseline Prompting Console */}
          <div className="lg:col-span-5 h-full min-h-[480px]">
            <PromptConsole
              messages={messages}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              errorMessage={errorMessage}
            />
          </div>

          {/* Right Column: Letter Document Workspace */}
          <div className="lg:col-span-7 h-full min-h-[480px]">
            <LetterDocument
              content={currentDraft}
              onContentChange={(newContent) => setCurrentDraft(newContent)}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </main>

      <DeploymentGuideModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  );
}
