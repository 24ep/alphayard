'use client'

import React from 'react'
import { 
  MailIcon, 
  SearchIcon, 
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  CodeIcon,
  InfoIcon
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AppEmailTemplate } from '../page'

interface EmailTemplateManagerProps {
  appId: string;
  emailTemplates: AppEmailTemplate[];
  defaultEmailTemplates: AppEmailTemplate[];
  emailTemplatesLoading: boolean;
  selectedTemplateId: string | null;
  selectedTemplateScope: 'app' | 'default';
  templateEditor: {
    name: string;
    slug: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    isActive: boolean;
    variables: any[];
  };
  setTemplateEditor: React.Dispatch<React.SetStateAction<any>>;
  templateMsg: string;
  onSelectTemplate: (template: AppEmailTemplate) => void;
  onSelectDefaultTemplate: (template: AppEmailTemplate) => void;
  onSaveTemplate: () => void;
  onDeleteTemplate: (id: string) => void;
  onAddTemplate?: () => void;
  onRefresh: () => void;
  setActiveDevGuide: (guide: string) => void;
}

export const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({
  appId,
  emailTemplates,
  defaultEmailTemplates,
  emailTemplatesLoading,
  selectedTemplateId,
  selectedTemplateScope,
  templateEditor,
  setTemplateEditor,
  templateMsg,
  onSelectTemplate,
  onSelectDefaultTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onAddTemplate,
  onRefresh,
  setActiveDevGuide
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Templates</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Override default system emails or create custom templates for your application.</p>
        </div>
        <div className="flex items-center gap-2">
           {templateMsg && (
             <span className={`text-xs font-medium ${templateMsg.includes('Saved') || templateMsg.includes('Reverted') ? 'text-emerald-600' : 'text-blue-600'}`}>
                {templateMsg}
             </span>
           )}
           <Button variant="outline" size="sm" onClick={onRefresh} disabled={emailTemplatesLoading} className="flex items-center gap-2">
              <RefreshCwIcon className={`w-4 h-4 ${emailTemplatesLoading ? 'animate-spin' : ''}`} />
              Refresh
           </Button>
           <Button 
            size="sm" 
            onClick={() => {
              if (onAddTemplate) {
                onAddTemplate()
              } else {
                setTemplateEditor({ name: '', slug: '', subject: '', htmlContent: '', textContent: '', isActive: true, variables: [] })
                onSelectTemplate({ id: '' } as any)
              }
            }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 flex items-center gap-2"
           >
              <PlusIcon className="w-4 h-4" />
              New Template
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Templates List */}
        <div className="space-y-4">
           <Card className="border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
             <div className="p-3 border-b border-gray-100 dark:border-zinc-800">
                <div className="relative">
                   <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                   <input type="text" placeholder="Search templates..." className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:outline-none" />
                </div>
             </div>
             <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="p-2 space-y-4">
                   {/* Custom Templates */}
                   <div>
                      <h4 className="px-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Application Overrides</h4>
                      <div className="space-y-1">
                         {emailTemplates.map(t => (
                           <button
                             key={t.id}
                             onClick={() => onSelectTemplate(t)}
                             className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                               selectedTemplateId === t.id && selectedTemplateScope === 'app'
                               ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-500/20'
                               : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-zinc-300'
                             }`}
                           >
                              <div className="min-w-0 pr-2">
                                 <div className="text-xs font-semibold truncate">{t.name}</div>
                                 <div className="text-[10px] text-gray-500 truncate">{t.slug}</div>
                              </div>
                              <ChevronRightIcon className="w-3.5 h-3.5 shrink-0 opacity-50" />
                           </button>
                         ))}
                         {emailTemplates.length === 0 && (
                           <div className="px-2 py-3 text-[10px] text-gray-400 italic">No overrides yet</div>
                         )}
                      </div>
                   </div>

                   {/* Default Templates */}
                   <div>
                      <h4 className="px-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Default Templates</h4>
                      <div className="space-y-1">
                         {defaultEmailTemplates.map(t => {
                           const isOverridden = emailTemplates.some(at => at.slug === t.slug)
                           return (
                             <button
                               key={t.id}
                               onClick={() => onSelectDefaultTemplate(t)}
                               className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                                 selectedTemplateId === t.id && selectedTemplateScope === 'default'
                                 ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-500/20'
                                 : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-zinc-300'
                               }`}
                             >
                                <div className="min-w-0 pr-2">
                                   <div className="flex items-center gap-1.5">
                                      <div className="text-xs font-semibold truncate">{t.name}</div>
                                      {isOverridden && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Overridden" />}
                                   </div>
                                   <div className="text-[10px] text-gray-500 truncate">{t.slug}</div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                   {isOverridden && <CheckIcon className="w-3 h-3 text-emerald-500" />}
                                   <ChevronRightIcon className="w-3.5 h-3.5 shrink-0 opacity-50" />
                                </div>
                             </button>
                           )
                         })}
                      </div>
                   </div>
                </div>
             </div>
           </Card>

           <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 p-4">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                 <CodeIcon className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase tracking-wider">Templating Guide</span>
              </div>
              <p className="text-[10px] text-gray-600 dark:text-zinc-400 leading-relaxed mb-3">
                Use liquid tags like <code>{`{{user.firstName}}`}</code> or <code>{`{{app.name}}`}</code> in your templates for dynamic content.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[10px] h-7 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                onClick={() => setActiveDevGuide('email_templates')}
              >
                View Variables Guide
              </Button>
           </div>
        </div>

        {/* Editor */}
        <div className="space-y-4">
           <Card className="border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden">
             <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                   <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedTemplateScope === 'default' ? 'Override Default' : (selectedTemplateId ? 'Edit Template' : 'New Template')}
                   </h4>
                   <p className="text-[10px] text-gray-500">
                      {selectedTemplateScope === 'default' ? 'Modifying this will create an application-specific override.' : 'Customize the content and delivery of this email.'}
                   </p>
                </div>
                <div className="flex items-center gap-2">
                   {selectedTemplateScope === 'app' && selectedTemplateId && (
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs text-red-500 hover:text-red-600 border-red-100 dark:border-red-900/30"
                        onClick={() => onDeleteTemplate(selectedTemplateId!)}
                     >
                        <Trash2Icon className="w-3.5 h-3.5 mr-1.5" />
                        Revert to Default
                     </Button>
                   )}
                   <Button size="sm" className="h-8 text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0" onClick={onSaveTemplate}>
                      <SaveIcon className="w-3.5 h-3.5 mr-1.5" />
                      Save Template
                   </Button>
                </div>
             </div>
             <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Display Name</label>
                      <input 
                        type="text" 
                        value={templateEditor.name} 
                        onChange={e => setTemplateEditor((prev: any) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                        placeholder="e.g. Welcome Email"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">System Slug</label>
                      <input 
                        type="text" 
                        value={templateEditor.slug} 
                        onChange={e => setTemplateEditor((prev: any) => ({ ...prev, slug: e.target.value }))}
                        readOnly={selectedTemplateScope === 'default'}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                          selectedTemplateScope === 'default' 
                          ? 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 focus:ring-blue-500/20'
                        }`}
                        placeholder="e.g. welcome-email"
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Email Subject</label>
                      <input 
                        type="text" 
                        value={templateEditor.subject} 
                        onChange={e => setTemplateEditor((prev: any) => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                        placeholder="Welcome to our platform!"
                      />
                   </div>

                   <div className="space-y-1.5">
                      <div className="flex items-center justify-between mb-1">
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">HTML Content</label>
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">Supports Liquid MJML</span>
                         </div>
                      </div>
                      <textarea 
                        rows={12} 
                        value={templateEditor.htmlContent} 
                        onChange={e => setTemplateEditor((prev: any) => ({ ...prev, htmlContent: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" 
                        placeholder="<div>Hello {{user.firstName}}...</div>"
                      />
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Text Fallback (Optional)</label>
                      <textarea 
                        rows={4} 
                        value={templateEditor.textContent} 
                        onChange={e => setTemplateEditor((prev: any) => ({ ...prev, textContent: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" 
                        placeholder="Plain text version of the email..."
                      />
                   </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
                   <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-900/30">
                      <InfoIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                         <strong>Preview Mode:</strong> You can send a test email to your admin address to see how this template renders with sample data.
                      </div>
                   </div>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
