import React from 'react';
import { PenLine, Sparkles, BookOpen, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onNewLetter: () => void;
  onOpenDeploymentGuide: () => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewLetter,
  onOpenDeploymentGuide,
  isGenerating,
}) => {
  return (
    <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs">
            <PenLine className="w-5 h-5 text-stone-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-stone-900 tracking-tight">
                Letter Writing Assistant
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100/80 text-emerald-900 border border-emerald-200/80">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                Peer Career Advisor
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Mentor sounding board for networking apologies, coffee chat follow-ups, and diplomatic emails
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="deployment-guide-btn"
            onClick={onOpenDeploymentGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 hover:text-stone-900 transition-colors shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
            <span>Vercel Deploy Guide</span>
          </button>

          <button
            type="button"
            id="new-letter-btn"
            onClick={onNewLetter}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-200/80 hover:bg-stone-200 transition-colors disabled:opacity-50"
            title="Start fresh conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Over</span>
          </button>
        </div>
      </div>
    </header>
  );
};
