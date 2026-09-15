import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, Terminal, Globe } from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const copyEnvVar = () => {
    navigator.clipboard.writeText('GEMINI_API_KEY');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full shadow-xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-stone-700" />
            <h2 className="text-sm font-semibold text-stone-900">
              Vercel Deployment Guide & Environment Variables
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-stone-700 leading-relaxed">
          {/* Key Callout */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-amber-900 text-xs mb-1">
                  Exact Required Environment Variable Name:
                </div>
                <div className="font-mono text-sm font-bold text-amber-950 bg-amber-100/70 px-2.5 py-1 rounded-md inline-block border border-amber-300/60">
                  GEMINI_API_KEY
                </div>
                <p className="text-[11px] text-amber-800/90 mt-1.5">
                  Both your development server and Vercel serverless functions (in <code className="font-mono">/api/generate.ts</code>) read this exact variable to authenticate requests with the Gemini API.
                </p>
              </div>
              <button
                type="button"
                onClick={copyEnvVar}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors shrink-0"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy Name'}</span>
              </button>
            </div>
          </div>

          {/* Step by step checklist */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Step-by-Step Vercel Deployment Process
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                  1
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Export or Push to Git</div>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Push your codebase to GitHub, GitLab, or Bitbucket. The repository already contains <code className="font-mono text-stone-700">/api/generate.ts</code> and <code className="font-mono text-stone-700">vercel.json</code>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                  2
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Import Project in Vercel</div>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Log in to <strong>vercel.com</strong>, click <strong>"Add New" &gt; "Project"</strong>, and import your repository.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                  3
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Configure Build & Output Settings</div>
                  <div className="mt-1 text-[11px] text-stone-600 space-y-0.5">
                    <div>• <strong>Framework Preset:</strong> Vite</div>
                    <div>• <strong>Build Command:</strong> <code className="font-mono bg-stone-200/70 px-1 rounded">vite build</code></div>
                    <div>• <strong>Output Directory:</strong> <code className="font-mono bg-stone-200/70 px-1 rounded">dist</code></div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                  4
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Add Environment Variable</div>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Under the <strong>Environment Variables</strong> section in Vercel:
                  </p>
                  <div className="mt-1.5 p-2 bg-stone-900 text-stone-100 rounded-lg font-mono text-[11px] space-y-1">
                    <div>Key: <span className="text-amber-400">GEMINI_API_KEY</span></div>
                    <div>Value: <span className="text-stone-400">&lt;Your Gemini API Key from Google AI Studio&gt;</span></div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                  5
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Deploy</div>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Click <strong>Deploy</strong>. Vercel will bundle the Vite frontend into static assets and deploy the backend serverless function to handle <code className="font-mono text-stone-700">/api/generate</code> securely without exposing keys to the browser.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-[11px] text-stone-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Security reminder:</strong> Never prefix with <code className="font-mono text-stone-800">VITE_</code>. The API key remains strictly server-side inside Vercel Serverless Functions.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-stone-900 text-white hover:bg-stone-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
