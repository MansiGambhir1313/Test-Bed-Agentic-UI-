import { useState } from 'react';
import { Icon } from '../ui/Icon';
import type { Skill } from '../../types';

interface SkillEditorProps {
  skill: Skill;
  onClose: () => void;
  onSave: (id: string, prompt: string) => void;
}

export function SkillEditor({ skill, onClose, onSave }: SkillEditorProps): JSX.Element {
  const [prompt, setPrompt] = useState(skill.prompt);

  const handleSave = () => {
    onSave(skill.id, prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay animate-fade-in p-6">
      <div className="bg-dark-300 border border-white/10 w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-white/5 rounded-t-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Icon name={skill.icon as any} size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Configure {skill.label}</h3>
              <p className="text-xs text-luxury-200">Edit skill instructions and behavior</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-luxury-200 hover:text-white transition"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-luxury-300 uppercase tracking-wider">
              System Prompt
            </label>
            <span className="text-[10px] text-luxury-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {prompt.length} chars
            </span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-dark-400 border border-white/10 rounded-lg p-5 text-sm text-luxury-100 font-mono resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed mac-scrollbar shadow-inner"
            spellCheck="false"
            placeholder="Enter detailed skill instructions here..."
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-xl flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-luxury-100 hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover transition shadow-md flex items-center gap-2"
          >
            <Icon name="Send" size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
