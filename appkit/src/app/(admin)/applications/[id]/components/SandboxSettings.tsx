import React from 'react'
import { GlobeIcon, CheckCircleIcon, XCircleIcon, ShieldCheckIcon, AlertTriangleIcon, MailIcon, Loader2Icon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SandboxSettingsProps {
  applicationName: string
  sandboxMode: 'login' | 'signup'
  setSandboxMode: (mode: 'login' | 'signup') => void
  sandboxResult: any
  setSandboxResult: (result: any) => void
  sandboxRunning: boolean
  onSimulate: (scenario: string) => void
  canonicalRedirectUri: string
}

export const SandboxSettings: React.FC<SandboxSettingsProps> = ({
  applicationName,
  sandboxMode,
  setSandboxMode,
  sandboxResult,
  setSandboxResult,
  sandboxRunning,
  onSimulate,
  canonicalRedirectUri,
}) => {
  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Login Sandbox</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Test and preview login & signup flows in a safe sandbox environment.</p>
        </div>
        <div className="flex items-center rounded-lg bg-gray-100 dark:bg-zinc-800 p-1">
          {(['login', 'signup'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => { setSandboxMode(mode); setSandboxResult(null) }}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                sandboxMode === mode
                  ? 'bg-white dark:bg-zinc-700 shadow text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700'
              }`}
            >
              {mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-950 p-8 flex flex-col items-center justify-center min-h-[420px]">
          <div className="w-full max-w-sm space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 mx-auto mb-3">
                {applicationName.substring(0, 2).toUpperCase()}
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {sandboxMode === 'login' ? `Sign in to ${applicationName}` : `Create your ${applicationName} account`}
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                {sandboxMode === 'login' ? 'Enter your credentials to continue' : 'Fill in the details below to get started'}
              </p>
            </div>
            {sandboxMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Email</label>
              <input type="email" placeholder="user@example.com" className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Password</label>
              <input type="password" placeholder={'••••••••'} className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm" />
            </div>
            {sandboxMode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Confirm Password</label>
                  <input type="password" placeholder={'••••••••'} className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm" />
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" title="Agree to terms and privacy policy" className="w-3.5 h-3.5 mt-0.5 text-blue-500 border-gray-300 dark:border-zinc-600 rounded" />
                  <span className="text-[11px] text-gray-500 dark:text-zinc-400">I agree to the Terms of Service and Privacy Policy</span>
                </label>
              </>
            )}
            <button className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
              {sandboxMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-gray-200 dark:border-zinc-700" />
              <span className="px-3 text-xs text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-200 dark:border-zinc-700" />
            </div>
            <button className="w-full py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center">
              <GlobeIcon className="w-4 h-4 mr-2" />
              Continue with Google
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-2">
              {sandboxMode === 'login'
                ? <span>Don&apos;t have an account? <button onClick={() => setSandboxMode('signup')} className="text-blue-500 font-medium">Sign up</button></span>
                : <span>Already have an account? <button onClick={() => setSandboxMode('login')} className="text-blue-500 font-medium">Sign in</button></span>
              }
            </p>
          </div>
        </div>

        {/* Controls & Response */}
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-3">Sandbox Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">Test User Email</label>
                <input title="Sandbox test user email" type="email" defaultValue="test@sandbox.example.com" className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">Redirect URL</label>
                <input title="Sandbox redirect URL" type="url" defaultValue={canonicalRedirectUri} className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-3">Test Scenarios</h4>
            <div className="space-y-2">
              {(sandboxMode === 'login' ? [
                { label: 'Simulate Login Success', desc: 'Successful auth flow', icon: <CheckCircleIcon className="w-4 h-4 text-emerald-500" /> },
                { label: 'Simulate Login Failure', desc: 'Error handling', icon: <XCircleIcon className="w-4 h-4 text-red-500" /> },
                { label: 'Simulate MFA Challenge', desc: 'MFA verification', icon: <ShieldCheckIcon className="w-4 h-4 text-violet-500" /> },
                { label: 'Simulate Account Lockout', desc: 'Lockout flow', icon: <AlertTriangleIcon className="w-4 h-4 text-amber-500" /> },
              ] : [
                { label: 'Simulate Signup Success', desc: 'Successful registration', icon: <CheckCircleIcon className="w-4 h-4 text-emerald-500" /> },
                { label: 'Simulate Signup Failure', desc: 'Validation errors', icon: <XCircleIcon className="w-4 h-4 text-red-500" /> },
                { label: 'Simulate Email Verification', desc: 'Email verification step', icon: <MailIcon className="w-4 h-4 text-blue-500" /> },
              ]).map((scenario) => (
                <button
                  key={scenario.label}
                  onClick={() => onSimulate(scenario.label)}
                  disabled={sandboxRunning}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-500/30 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all text-left disabled:opacity-50"
                >
                  {scenario.icon}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{scenario.label}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{scenario.desc}</p>
                  </div>
                  {sandboxRunning && <Loader2Icon className="w-4 h-4 animate-spin text-blue-500" />}
                </button>
              ))}
            </div>
          </div>

          {sandboxResult && (
            <div className="rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${sandboxResult.status === 200 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-xs font-bold text-gray-600 dark:text-zinc-300">Response ({sandboxResult.status})</span>
                </div>
                <button onClick={() => setSandboxResult(null)} title="Dismiss result" className="text-gray-400 hover:text-gray-500">
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-4 bg-[#0d1117] text-gray-300 text-xs overflow-x-auto max-h-48">
                <code>{JSON.stringify(sandboxResult.body, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
