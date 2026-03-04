'use client'

import React from 'react'
import { 
  ShieldIcon, 
  ShieldCheckIcon,
  LockIcon,
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
  SaveIcon,
  Loader2Icon,
  CodeIcon,
  RefreshCwIcon,
  AlertCircleIcon
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Switch } from '@/components/ui/switch'

interface SecuritySettingsProps {
  securityConfig: any;
  setSecurityConfig: React.Dispatch<React.SetStateAction<any>>;
  securitySaving: boolean;
  securityMsg: string;
  onSaveSecurity: () => void;
  identityConfig: any;
  setIdentityConfig: React.Dispatch<React.SetStateAction<any>>;
  identitySaving: boolean;
  identityMsg: string;
  onSaveIdentity: () => void;
  setActiveDevGuide: (guide: string) => void;
  renderMode?: 'identity' | 'security';
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  securityConfig,
  setSecurityConfig,
  securitySaving,
  securityMsg,
  onSaveSecurity,
  identityConfig,
  setIdentityConfig,
  identitySaving,
  identityMsg,
  onSaveIdentity,
  setActiveDevGuide,
  renderMode
}) => {
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
    <div className="space-y-8">
      {/* MFA Configuration */}
      {(renderMode === 'security' || !renderMode) && (
        <section>
          {renderTabHeader('MFA & Security', 'security-mfa')}
          <Card className="border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">Multi-Factor Authentication</CardTitle>
                <p className="text-sm text-gray-500 dark:text-zinc-400">Require additional verification steps for user logins.</p>
              </div>
              <div className="flex items-center gap-2">
                 {securityMsg && <span className="text-xs text-blue-600">{securityMsg}</span>}
                 <Button size="sm" onClick={onSaveSecurity} disabled={securitySaving}>
                    {securitySaving ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
                    Save MFA Config
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                              <LockIcon className="w-4 h-4" />
                           </div>
                           <div>
                              <div className="text-sm font-medium">Authenticator App (TOTP)</div>
                              <p className="text-[10px] text-gray-500">Google Authenticator, Authy, etc.</p>
                           </div>
                        </div>
                        <Switch 
                          checked={securityConfig.mfa.totp} 
                          onCheckedChange={checked => setSecurityConfig((prev: any) => ({ ...prev, mfa: { ...prev.mfa, totp: checked } }))} 
                        />
                     </div>

                     <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                              <MailIcon className="w-4 h-4" />
                           </div>
                           <div>
                              <div className="text-sm font-medium">Email Verification</div>
                              <p className="text-[10px] text-gray-500">OTP sent to registered email.</p>
                           </div>
                        </div>
                        <Switch 
                          checked={securityConfig.mfa.email} 
                          onCheckedChange={checked => setSecurityConfig((prev: any) => ({ ...prev, mfa: { ...prev.mfa, email: checked } }))} 
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                              <ShieldIcon className="w-4 h-4" />
                           </div>
                           <div>
                              <div className="text-sm font-medium">SMS Verification</div>
                              <p className="text-[10px] text-gray-500">Text message OTP (Requires Twilio).</p>
                           </div>
                        </div>
                        <Switch 
                          checked={securityConfig.mfa.sms} 
                          onCheckedChange={checked => setSecurityConfig((prev: any) => ({ ...prev, mfa: { ...prev.mfa, sms: checked } }))} 
                        />
                     </div>

                     <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                              <KeyIcon className="w-4 h-4" />
                           </div>
                           <div>
                              <div className="text-sm font-medium">FIDO2 / WebAuthn</div>
                              <p className="text-[10px] text-gray-500">Biometrics, TouchID, YubiKey.</p>
                           </div>
                        </div>
                        <Switch 
                          checked={securityConfig.mfa.fido2} 
                          onCheckedChange={checked => setSecurityConfig((prev: any) => ({ ...prev, mfa: { ...prev.mfa, fido2: checked } }))} 
                        />
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Identity & Scopes */}
      {(renderMode === 'identity' || !renderMode) && (
        <section>
          {renderTabHeader('Identity Scopes', 'identity-scopes')}
          <Card className="border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                 <CardTitle className="text-lg font-semibold">Scopes & User Data</CardTitle>
                 <p className="text-sm text-gray-500 dark:text-zinc-400">Define what user information this application can access.</p>
              </div>
              <div className="flex items-center gap-2">
                 {identityMsg && <span className="text-xs text-blue-600">{identityMsg}</span>}
                 <Button size="sm" onClick={onSaveIdentity} disabled={identitySaving}>
                    {identitySaving ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
                    Save Identity Config
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Identity Model</label>
                  <div className="flex gap-4">
                     <button 
                       onClick={() => setIdentityConfig((prev: any) => ({ ...prev, model: 'Email-based' }))}
                       className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                         identityConfig.model === 'Email-based' 
                         ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                         : 'border-gray-200 dark:border-zinc-800 text-gray-600 hover:bg-gray-50'
                       }`}
                     >
                        Email-based
                     </button>
                     <button 
                       onClick={() => setIdentityConfig((prev: any) => ({ ...prev, model: 'Username-based' }))}
                       className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                         identityConfig.model === 'Username-based' 
                         ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                         : 'border-gray-200 dark:border-zinc-800 text-gray-600 hover:bg-gray-50'
                       }`}
                     >
                        Username-based
                     </button>
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Available Scopes</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     {Object.entries(identityConfig.scopes).map(([key, value]) => (
                       <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                          <Switch 
                            checked={value as boolean} 
                            onCheckedChange={checked => setIdentityConfig((prev: any) => ({ ...prev, scopes: { ...prev.scopes, [key]: checked } }))} 
                          />
                          <span className="text-sm font-medium capitalize">{key === 'openid' ? 'OpenID' : key}</span>
                       </label>
                     ))}
                  </div>
               </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}

// Minimal MailIcon for the import above if lucide-react doesn't export it in this version or to be safe
import { Mail as MailIcon } from 'lucide-react'
