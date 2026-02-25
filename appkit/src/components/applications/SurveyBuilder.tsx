'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  PlusIcon,
  TrashIcon,
  GripVerticalIcon,
  TypeIcon,
  ListIcon,
  CheckSquareIcon,
  StarIcon,
  ToggleLeftIcon,
  CopyIcon,
  CheckCircle2Icon,
  PlayIcon,
  EyeIcon,
  SaveIcon,
  Loader2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  CodeIcon,
  ExternalLinkIcon,
} from 'lucide-react'
import { adminService } from '@/services/adminService'

interface SurveyQuestion {
  id: string
  type: 'text' | 'single_choice' | 'multi_choice' | 'rating' | 'boolean'
  title: string
  description: string
  required: boolean
  options: string[]
  maxRating?: number
}

interface Survey {
  id: string
  title: string
  description: string
  active: boolean
  completionMessage: string
  questions: SurveyQuestion[]
}

const QUESTION_TYPES = [
  { value: 'text' as const, label: 'Text Input', icon: <TypeIcon className="w-4 h-4" /> },
  { value: 'single_choice' as const, label: 'Single Choice', icon: <ListIcon className="w-4 h-4" /> },
  { value: 'multi_choice' as const, label: 'Multi Choice', icon: <CheckSquareIcon className="w-4 h-4" /> },
  { value: 'rating' as const, label: 'Rating', icon: <StarIcon className="w-4 h-4" /> },
  { value: 'boolean' as const, label: 'Yes / No', icon: <ToggleLeftIcon className="w-4 h-4" /> },
]

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

export default function SurveyBuilder({ appId }: { appId: string }) {
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: generateId(),
      title: 'Onboarding Feedback',
      description: 'Collect feedback from new users after they complete onboarding.',
      active: true,
      completionMessage: 'Thank you for your feedback!',
      questions: [
        { id: generateId(), type: 'rating', title: 'How easy was the onboarding process?', description: '', required: true, options: [], maxRating: 5 },
        { id: generateId(), type: 'single_choice', title: 'How did you hear about us?', description: '', required: false, options: ['Search Engine', 'Social Media', 'Friend / Colleague', 'Other'] },
      ],
    },
  ])
  const [activeSurveyId, setActiveSurveyId] = useState<string | null>(surveys[0]?.id || null)
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedQ, setExpandedQ] = useState<string | null>(null)
  const [showIntegration, setShowIntegration] = useState(false)

  const activeSurvey = surveys.find(s => s.id === activeSurveyId) || null

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const addSurvey = () => {
    const newSurvey: Survey = {
      id: generateId(),
      title: 'New Survey',
      description: '',
      active: false,
      completionMessage: 'Thank you!',
      questions: [],
    }
    setSurveys(prev => [...prev, newSurvey])
    setActiveSurveyId(newSurvey.id)
  }

  const updateSurvey = (field: keyof Survey, value: any) => {
    if (!activeSurveyId) return
    setSurveys(prev => prev.map(s => s.id === activeSurveyId ? { ...s, [field]: value } : s))
  }

  const deleteSurvey = (id: string) => {
    setSurveys(prev => prev.filter(s => s.id !== id))
    if (activeSurveyId === id) setActiveSurveyId(surveys.find(s => s.id !== id)?.id || null)
  }

  const addQuestion = () => {
    if (!activeSurvey) return
    const q: SurveyQuestion = { id: generateId(), type: 'text', title: '', description: '', required: false, options: [] }
    updateSurvey('questions', [...activeSurvey.questions, q])
    setExpandedQ(q.id)
  }

  const updateQuestion = (qId: string, field: keyof SurveyQuestion, value: any) => {
    if (!activeSurvey) return
    updateSurvey('questions', activeSurvey.questions.map(q => q.id === qId ? { ...q, [field]: value } : q))
  }

  const removeQuestion = (qId: string) => {
    if (!activeSurvey) return
    updateSurvey('questions', activeSurvey.questions.filter(q => q.id !== qId))
  }

  const moveQuestion = (qId: string, dir: -1 | 1) => {
    if (!activeSurvey) return
    const qs = [...activeSurvey.questions]
    const idx = qs.findIndex(q => q.id === qId)
    if (idx < 0 || (dir === -1 && idx === 0) || (dir === 1 && idx === qs.length - 1)) return
    const [item] = qs.splice(idx, 1)
    qs.splice(idx + dir, 0, item)
    updateSurvey('questions', qs)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await adminService.saveAppConfig(appId, 'surveys', { surveys })
    } catch (err) {
      console.error('Failed to save surveys:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Survey List + Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {surveys.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiveSurveyId(s.id); setPreviewMode(false) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSurveyId === s.id
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
              }`}
            >
              {s.title || 'Untitled'}
              {s.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block ml-1.5" />}
            </button>
          ))}
          <button onClick={addSurvey} className="p-1.5 rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowIntegration(!showIntegration)}>
            <CodeIcon className="w-4 h-4 mr-1.5" />
            Integration
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            {saving ? <Loader2Icon className="w-4 h-4 mr-1.5 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-1.5" />}
            Save
          </Button>
        </div>
      </div>

      {/* Integration Guide */}
      {showIntegration && (
        <div className="rounded-xl border border-blue-200/50 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
            <CodeIcon className="w-4 h-4" />
            Survey SDK Integration
          </h4>
          <div className="relative group">
            <div className="absolute right-3 top-3">
              <button onClick={() => handleCopy(`import { AppKit } from '@appkit/identity-core';\n\nconst client = new AppKit({ clientId: '${appId}' });\n\n// Trigger a survey\nawait client.showSurvey('${activeSurvey?.id || 'SURVEY_ID'}');\n\n// Listen for completion\nclient.on('survey:completed', (response) => {\n  console.log('Survey responses:', response.answers);\n});`, 'survey-sdk')} className="p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
                {copiedId === 'survey-sdk' ? <CheckCircle2Icon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#0d1117] text-gray-300 text-xs overflow-x-auto border border-gray-800">
              <code>{`import { AppKit } from '@appkit/identity-core';

const client = new AppKit({ clientId: '${appId}' });

// Trigger a survey
await client.showSurvey('${activeSurvey?.id || 'SURVEY_ID'}');

// Listen for completion
client.on('survey:completed', (response) => {
  console.log('Survey responses:', response.answers);
});`}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Survey Editor / Preview */}
      {activeSurvey && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            {/* Survey Meta */}
            <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Survey Details</h4>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={activeSurvey.active} onChange={() => updateSurvey('active', !activeSurvey.active)} />
                    <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-emerald-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                  <span className={`text-[10px] font-bold uppercase ${activeSurvey.active ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {activeSurvey.active ? 'Active' : 'Draft'}
                  </span>
                  <button onClick={() => deleteSurvey(activeSurvey.id)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 hover:text-red-500 ml-2" title="Delete survey">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={activeSurvey.title}
                onChange={e => updateSurvey('title', e.target.value)}
                placeholder="Survey title"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <textarea
                value={activeSurvey.description}
                onChange={e => updateSurvey('description', e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <input
                type="text"
                value={activeSurvey.completionMessage}
                onChange={e => updateSurvey('completionMessage', e.target.value)}
                placeholder="Completion message"
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Questions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Questions ({activeSurvey.questions.length})</h4>
                <button onClick={addQuestion} className="text-xs text-blue-500 font-bold flex items-center gap-1 hover:text-blue-600">
                  <PlusIcon className="w-3 h-3" /> Add Question
                </button>
              </div>

              {activeSurvey.questions.map((q, idx) => {
                const qType = QUESTION_TYPES.find(t => t.value === q.type)
                const isExpanded = expandedQ === q.id
                return (
                  <div key={q.id} className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-zinc-800/30" onClick={() => setExpandedQ(isExpanded ? null : q.id)}>
                      <GripVerticalIcon className="w-3.5 h-3.5 text-gray-300 dark:text-zinc-600 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-gray-400 w-5">{idx + 1}</span>
                      <span className="text-gray-400">{qType?.icon}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">{q.title || 'Untitled question'}</span>
                      {q.required && <span className="text-[8px] font-bold text-red-500 uppercase">Required</span>}
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, -1) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400"><ChevronUpIcon className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, 1) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400"><ChevronDownIcon className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); removeQuestion(q.id) }} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400"><TrashIcon className="w-3 h-3" /></button>
                      </div>
                    </div>
                    {/* Body */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3 border-t border-gray-100 dark:border-zinc-800 pt-3">
                        <input
                          type="text"
                          value={q.title}
                          onChange={e => updateQuestion(q.id, 'title', e.target.value)}
                          placeholder="Question title"
                          className="w-full px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <div className="flex items-center gap-3">
                          <select
                            value={q.type}
                            onChange={e => updateQuestion(q.id, 'type', e.target.value as SurveyQuestion['type'])}
                            className="px-2 py-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={q.required} onChange={() => updateQuestion(q.id, 'required', !q.required)} className="w-3.5 h-3.5 text-blue-500 border-gray-300 dark:border-zinc-600 rounded" />
                            <span className="text-xs text-gray-500">Required</span>
                          </label>
                        </div>

                        {/* Options for choice types */}
                        {(q.type === 'single_choice' || q.type === 'multi_choice') && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Options</label>
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-zinc-600 flex items-center justify-center text-[8px] text-gray-400 flex-shrink-0">{oi + 1}</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={e => {
                                    const newOpts = [...q.options]
                                    newOpts[oi] = e.target.value
                                    updateQuestion(q.id, 'options', newOpts)
                                  }}
                                  className="flex-1 px-2 py-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button onClick={() => updateQuestion(q.id, 'options', q.options.filter((_, i) => i !== oi))} className="text-red-400 hover:text-red-500 p-0.5"><TrashIcon className="w-3 h-3" /></button>
                              </div>
                            ))}
                            <button onClick={() => updateQuestion(q.id, 'options', [...q.options, ''])} className="text-xs text-blue-500 font-medium flex items-center gap-1 hover:text-blue-600">
                              <PlusIcon className="w-3 h-3" /> Add Option
                            </button>
                          </div>
                        )}

                        {q.type === 'rating' && (
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Max Rating</label>
                            <input type="number" min={3} max={10} value={q.maxRating || 5} onChange={e => updateQuestion(q.id, 'maxRating', parseInt(e.target.value))} className="ml-2 w-16 px-2 py-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-xs" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {activeSurvey.questions.length === 0 && (
                <button onClick={addQuestion} className="w-full p-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/20 transition-all group">
                  <PlusIcon className="w-6 h-6 text-gray-300 dark:text-zinc-600 group-hover:text-blue-500 mb-2 transition-colors" />
                  <p className="text-xs text-gray-400 group-hover:text-blue-500 font-medium transition-colors">Add your first question</p>
                </button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-950 p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <EyeIcon className="w-3 h-3" /> Live Preview
              </h4>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-zinc-800/50 p-6 max-w-sm mx-auto space-y-5">
              <div className="text-center">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{activeSurvey.title || 'Survey Title'}</h3>
                {activeSurvey.description && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{activeSurvey.description}</p>}
              </div>
              {activeSurvey.questions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                    {idx + 1}. {q.title || 'Untitled'} {q.required && <span className="text-red-500">*</span>}
                  </label>
                  {q.type === 'text' && (
                    <input type="text" placeholder="Type your answer..." className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs" disabled />
                  )}
                  {(q.type === 'single_choice' || q.type === 'multi_choice') && (
                    <div className="space-y-1.5">
                      {q.options.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800 cursor-default">
                          <input type={q.type === 'single_choice' ? 'radio' : 'checkbox'} disabled className="w-3.5 h-3.5" name={`preview-${q.id}`} />
                          <span className="text-xs text-gray-600 dark:text-zinc-400">{opt || `Option ${i + 1}`}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === 'rating' && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: q.maxRating || 5 }).map((_, i) => (
                        <StarIcon key={i} className="w-5 h-5 text-gray-300 dark:text-zinc-600" />
                      ))}
                    </div>
                  )}
                  {q.type === 'boolean' && (
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800 text-xs text-gray-500 border border-gray-200 dark:border-zinc-700" disabled>Yes</button>
                      <button className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800 text-xs text-gray-500 border border-gray-200 dark:border-zinc-700" disabled>No</button>
                    </div>
                  )}
                </div>
              ))}
              {activeSurvey.questions.length > 0 && (
                <button className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs font-medium cursor-default opacity-80 mt-3">
                  Submit Survey
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {surveys.length === 0 && (
        <div className="text-center py-16">
          <StarIcon className="w-10 h-10 text-gray-200 dark:text-zinc-800 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No Surveys Yet</h3>
          <p className="text-xs text-gray-500 mb-4">Create your first survey to start collecting user feedback.</p>
          <Button onClick={addSurvey} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            <PlusIcon className="w-4 h-4 mr-1.5" />Create Survey
          </Button>
        </div>
      )}
    </div>
  )
}
