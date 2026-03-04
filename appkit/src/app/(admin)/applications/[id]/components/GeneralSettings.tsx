'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { 
  SaveIcon, 
  Loader2Icon, 
  CodeIcon, 
  GlobeIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  Trash2Icon, 
  PlusIcon,
  CopyIcon,
  CheckIcon,
  RotateCwIcon,
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon
} from 'lucide-react'
import { isValidRedirectUri, isValidPostAuthRedirect, maskSecret, maskSecretCommon } from './utils'

interface GeneralSettingsProps {
  application: any;
  setApplication: React.Dispatch<React.SetStateAction<any>>;
  appBranding: any;
  setAppBranding: React.Dispatch<React.SetStateAction<any>>;
  generalSaving: boolean;
  generalMsg: string;
  onSave: () => void;
  logoUploading: boolean;
  onLogoUpload: (file: File) => void;
  logoFileInputRef: React.RefObject<HTMLInputElement>;
  newRedirectUri: string;
  setNewRedirectUri: (uri: string) => void;
  onAddRedirectUri: () => void;
  onRemoveRedirectUri: (uri: string) => void;
  onMoveRedirectUri: (uri: string, direction: 'up' | 'down') => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  generatedClientId: string | null;
  generatedClientSecret: string | null;
  showGeneratedClientSecret: boolean;
  setShowGeneratedClientSecret: (show: boolean) => void;
  generateClientIdOnSave: boolean;
  setGenerateClientIdOnSave: (generate: boolean) => void;
  setShowRotateSecretConfirm: (show: boolean) => void;
  setActiveDevGuide: (guide: string) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  application,
  setApplication,
  appBranding,
  setAppBranding,
  generalSaving,
  generalMsg,
  onSave,
  logoUploading,
  onLogoUpload,
  logoFileInputRef,
  newRedirectUri,
  setNewRedirectUri,
  onAddRedirectUri,
  onRemoveRedirectUri,
  onMoveRedirectUri,
  onCopy,
  copiedId,
  generatedClientId,
  generatedClientSecret,
  showGeneratedClientSecret,
  setShowGeneratedClientSecret,
  generateClientIdOnSave,
  setGenerateClientIdOnSave,
  setShowRotateSecretConfirm,
  setActiveDevGuide
}) => {
  if (!application) return null

  const authBehavior = application.authBehavior || {
    signupEnabled: true,
    emailVerificationRequired: false,
    inviteOnly: false,
    allowedEmailDomains: [],
    postLoginRedirect: '',
    postSignupRedirect: ''
  }

  const isPostLoginRedirectValid = isValidPostAuthRedirect(authBehavior.postLoginRedirect || '')
  const isPostSignupRedirectValid = isValidPostAuthRedirect(authBehavior.postSignupRedirect || '')
  const hasInvalidPostAuthRedirect = !isPostLoginRedirectValid || !isPostSignupRedirectValid

  const renderTabHeader = (title: string, guideKey: string, actions?: React.ReactNode) => (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveDevGuide(guideKey)}
          className="inline-flex rounded-lg border border-blue-200/60 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 items-center gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
        >
          <CodeIcon className="w-3.5 h-3.5" /> Dev Guide
        </button>
        {actions}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {renderTabHeader('General Settings', 'app-metadata')}
      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">General Settings</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Configure your application&apos;s identity, platform, and metadata.</p>
          </div>
          <div className="flex items-center gap-2">
            {generalMsg && <span className={`text-xs font-medium ${generalMsg === 'Saved!' ? 'text-emerald-600' : 'text-red-500'}`}>{generalMsg}</span>}
            <Button onClick={onSave} disabled={generalSaving || hasInvalidPostAuthRedirect} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
              {generalSaving ? <Loader2Icon className="w-4 h-4 mr-1.5 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-1.5" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Platform Type</label>
          <select
            title="Platform type"
            value={application.platform}
            onChange={e => setApplication((prev: any) => prev ? { ...prev, platform: e.target.value } : prev)}
            className="w-full max-w-xs px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="web">Web Application</option>
            <option value="mobile">Mobile Application</option>
          </select>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-3 items-start py-2">
            <div className="md:pr-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Identity</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Logo, app name, and description</p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500/30 transition-colors cursor-pointer group shrink-0"
                onClick={() => logoFileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                  {application.logoUrl ? (
                    <img src={application.logoUrl} alt={`${application.name} logo`} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    application.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <p className="mt-2 text-[9px] text-gray-500 dark:text-zinc-400 text-center">
                  {logoUploading ? 'Uploading...' : 'Click to upload logo'}
                </p>
                <input
                  ref={logoFileInputRef}
                  type="file"
                  accept="image/*"
                  title="Upload application logo"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onLogoUpload(file)
                    e.currentTarget.value = ''
                  }}
                />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={logoUploading}
                    title="Upload application logo"
                  >
                    {logoUploading ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                    Logo must be uploaded from file (URL input disabled)
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Application Name</label>
                  <input type="text" title="Application name" value={application.name} onChange={e => setApplication((prev: any) => prev ? { ...prev, name: e.target.value } : prev)} className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Description</label>
                  <textarea title="Application description" value={application.description} onChange={e => setApplication((prev: any) => prev ? { ...prev, description: e.target.value } : prev)} rows={2} className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-3 items-start py-2">
            <div className="md:pr-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">URLs & Status</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">{application.platform === 'web' ? 'Application URL' : 'App Store URL'}</label>
                <input type="url" value={application.appUrl || application.domain || ''} onChange={e => setApplication((prev: any) => prev ? { ...prev, appUrl: e.target.value } : prev)} placeholder={application.platform === 'web' ? 'https://your-app.com' : 'https://apps.apple.com/...'} className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Status</label>
                <select title="Application status" value={application.status} onChange={e => setApplication((prev: any) => prev ? { ...prev, status: e.target.value as any } : prev)} className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="development">Development</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-3 items-start py-2">
            <div className="md:pr-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Login & Signup Behavior</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Control signup policy and post-auth redirects.</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={authBehavior.signupEnabled}
                    onChange={e => setApplication((prev: any) => prev ? { ...prev, authBehavior: { ...authBehavior, signupEnabled: e.target.checked } } : prev)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-zinc-600"
                  />
                  Signup enabled
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={authBehavior.emailVerificationRequired}
                    onChange={e => setApplication((prev: any) => prev ? { ...prev, authBehavior: { ...authBehavior, emailVerificationRequired: e.target.checked } } : prev)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-zinc-600"
                  />
                  Require email verification
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={authBehavior.inviteOnly}
                    onChange={e => setApplication((prev: any) => prev ? { ...prev, authBehavior: { ...authBehavior, inviteOnly: e.target.checked } } : prev)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-zinc-600"
                  />
                  Invite only
                </label>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Allowed Email Domains (comma-separated)</label>
                <input
                  type="text"
                  value={(authBehavior.allowedEmailDomains || []).join(', ')}
                  onChange={e => setApplication((prev: any) => prev ? {
                    ...prev,
                    authBehavior: {
                      ...authBehavior,
                      allowedEmailDomains: e.target.value
                        .split(',')
                        .map((v: string) => v.trim().toLowerCase())
                        .filter(Boolean)
                    }
                  } : prev)}
                  placeholder="example.com, company.org"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Post Login Redirect</label>
                  <input
                    type="text"
                    value={authBehavior.postLoginRedirect || ''}
                    onChange={e => setApplication((prev: any) => prev ? { ...prev, authBehavior: { ...authBehavior, postLoginRedirect: e.target.value } } : prev)}
                    placeholder="/dashboard"
                    className={`w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      isPostLoginRedirectValid
                        ? 'border-gray-200 dark:border-zinc-700 focus:ring-blue-500/20'
                        : 'border-red-300 dark:border-red-600 focus:ring-red-500/20'
                    }`}
                  />
                  {!isPostLoginRedirectValid && (
                    <p className="mt-1 text-xs text-red-500">Use a relative path like `/dashboard` or an absolute `https://...` URL.</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block mb-1">Post Signup Redirect</label>
                  <input
                    type="text"
                    value={authBehavior.postSignupRedirect || ''}
                    onChange={e => setApplication((prev: any) => prev ? { ...prev, authBehavior: { ...authBehavior, postSignupRedirect: e.target.value } } : prev)}
                    placeholder="/welcome"
                    className={`w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      isPostSignupRedirectValid
                        ? 'border-gray-200 dark:border-zinc-700 focus:ring-blue-500/20'
                        : 'border-red-300 dark:border-red-600 focus:ring-red-500/20'
                    }`}
                  />
                  {!isPostSignupRedirectValid && (
                    <p className="mt-1 text-xs text-red-500">Use a relative path like `/welcome` or an absolute `https://...` URL.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* OIDC Credentials Section - Extracted from original page logic */}
      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">OIDC Credentials</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Manage your OAuth client ID and secret for application integration.</p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-3 items-center py-2">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Client ID</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-sm font-mono break-all text-gray-800 dark:text-zinc-300">
                {generatedClientId || application.oauthClientId || 'Not generated'}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onCopy(generatedClientId || application.oauthClientId || '', 'client-id')}
                className="shrink-0"
              >
                {copiedId === 'client-id' ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4" />}
              </Button>
              {!application.oauthClientId && !generatedClientId && (
                <Button 
                  size="sm"
                  onClick={() => setGenerateClientIdOnSave(true)}
                  variant={generateClientIdOnSave ? "secondary" : "outline"}
                >
                  {generateClientIdOnSave ? 'Generate on Save (Pending)' : 'Generate Client ID'}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-3 items-center py-2">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Client Secret</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-sm font-mono break-all text-gray-800 dark:text-zinc-300 flex items-center justify-between">
                <span>
                  {generatedClientSecret 
                    ? (showGeneratedClientSecret ? generatedClientSecret : maskSecret(generatedClientSecret))
                    : (application.oauthClientSecretConfigured 
                        ? maskSecretCommon(application.oauthClientSecretLast4)
                        : '••••••••••••••••••••••••••••••••')
                  }
                </span>
                {generatedClientSecret && (
                  <button onClick={() => setShowGeneratedClientSecret(!showGeneratedClientSecret)} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded transition-colors">
                    {showGeneratedClientSecret ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {generatedClientSecret ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onCopy(generatedClientSecret, 'client-secret')}
                  className="shrink-0"
                >
                  {copiedId === 'client-secret' ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4" />}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowRotateSecretConfirm(true)} className="flex items-center gap-2">
                  <RotateCwIcon className="w-4 h-4" />
                  Rotate Secret
                </Button>
              )}
            </div>
          </div>

          {/* Redirect URIs */}
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Allowed Redirect URIs</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://yourapp.com/callback"
                  value={newRedirectUri}
                  onChange={e => setNewRedirectUri(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onAddRedirectUri()}
                  className="px-3 py-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <Button size="sm" onClick={onAddRedirectUri} className="h-7 px-2">
                  <PlusIcon className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {(application.oauthRedirectUris || []).map((uri: string, idx: number) => (
                <div key={uri} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-lg group">
                  <GripVerticalIcon className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                  <code className="flex-1 text-xs truncate text-gray-700 dark:text-zinc-300">{uri}</code>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onMoveRedirectUri(uri, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-gray-500 disabled:opacity-30">
                      <ChevronUpIcon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onMoveRedirectUri(uri, 'down')} disabled={idx === (application.oauthRedirectUris?.length || 0) - 1} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-gray-500 disabled:opacity-30">
                      <ChevronDownIcon className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onRemoveRedirectUri(uri)} className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-gray-500 hover:text-red-500">
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {(!application.oauthRedirectUris || application.oauthRedirectUris.length === 0) && (
                <p className="text-center py-4 text-xs text-gray-400 italic">No redirect URIs configured. At least one is required for OIDC.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
