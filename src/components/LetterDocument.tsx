import React, { useState } from 'react';
import { Copy, Check, Download, FileText, Edit3, Eye } from 'lucide-react';
import Markdown from 'react-markdown';

interface LetterDocumentProps {
  content: string;
  onContentChange: (newContent: string) => void;
  isGenerating: boolean;
}

export const LetterDocument: React.FC<LetterDocumentProps> = ({
  content,
  onContentChange,
  isGenerating,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readingTime = Math.ceil(wordCount / 200);

  const handleCopyEmail = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email', err);
    }
  };

  const handleDownload = (format: 'txt' | 'md') => {
    if (!content) return;
    const mimeType = format === 'txt' ? 'text/plain' : 'text/markdown';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apology-email-draft.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      {/* Top Document Toolbar */}
      <div className="px-5 py-3 border-b border-stone-100 bg-stone-50/60 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
            <FileText className="w-4 h-4 text-stone-600" />
            <span>Advisor Workspace</span>
          </div>
          {content && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-stone-500">
              <span>•</span>
              <span>{wordCount} words</span>
              <span>•</span>
              <span>~{readingTime} min read</span>
            </div>
          )}
        </div>

        {content && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              id="copy-email-btn"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors"
              title="Copy draft email to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-semibold text-emerald-800">Email Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Copy Email</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="toggle-edit-mode-btn"
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                isEditing
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Preview' : 'Edit'}</span>
            </button>

            <button
              type="button"
              id="download-txt-btn"
              onClick={() => handleDownload('txt')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 transition-colors"
              title="Download text file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>TXT</span>
            </button>

            <button
              type="button"
              id="download-md-btn"
              onClick={() => handleDownload('md')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 transition-colors"
              title="Download markdown file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>MD</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Document Body */}
      <div className="flex-1 p-6 overflow-y-auto bg-stone-100/60 flex justify-center">
        {!content && !isGenerating ? (
          <div className="m-auto text-center max-w-sm p-8 border border-dashed border-stone-300 rounded-2xl bg-white/70">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-stone-800 mb-1">
              Draft Email
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Your draft email will appear here once you and your advisor agree on the tone and are ready to draft.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white border border-stone-200/90 rounded-xl p-8 sm:p-10 shadow-xs min-h-[500px] flex flex-col transition-all">
            {/* Content Area - Only the email content itself */}
            {isEditing ? (
              <textarea
                id="edit-letter-textarea"
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className="w-full flex-1 min-h-[400px] text-stone-800 font-sans text-xs leading-relaxed p-3 border border-stone-200 rounded-lg focus:outline-hidden focus:border-stone-400 resize-none font-mono"
              />
            ) : (
              <div className="whitespace-pre-wrap font-sans text-stone-800 text-xs sm:text-sm leading-relaxed">
                <Markdown>{content}</Markdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

