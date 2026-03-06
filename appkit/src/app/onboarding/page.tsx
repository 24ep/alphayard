'use client'

import React, { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '../../services/authService'
import { organizationService } from '../../services/organizationService'

type Step =
  | 'loading'
  | 'choose'
  | 'join-enter'
  | 'join-confirm'
  | 'create-form'
  | 'submitting'

interface InviteInfo {
  code: string
  orgName: string
  orgSlug: string
  orgId: string
  role: string
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function OnboardingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('loading')
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')

  // Join flow
  const [inviteCode, setInviteCode] = useState('')
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)

  // Create flow
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [orgDesc, setOrgDesc] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Auto-derive slug from name
  useEffect(() => {
    if (!slugManuallyEdited && orgName) {
      setOrgSlug(toSlug(orgName))
    }
  }, [orgName, slugManuallyEdited])

  // Auth + org check on mount
  useEffect(() => {
    authService.initSession().then(async u => {
      if (!u) {
        router.push('/login')
        return
      }
      setUser(u)
      // If already has org, go to dashboard
      try {
        const data = await organizationService.getMyOrganizations()
        if (data.hasOrganization) {
          router.push('/dashboard')
          return
        }
      } catch {
        // ignore — proceed to onboarding
      }
      // Pre-fill invite code from ?invite= query param
      const prefilledCode = searchParams?.get('invite')
      if (prefilledCode) {
        setInviteCode(prefilledCode)
        setStep('join-enter')
      } else {
        setStep('choose')
      }
    })
  }, [router, searchParams])

  const handleValidateInvite = useCallback(async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code')
      return
    }
    setError('')
    setStep('submitting')
    try {
      const res = await organizationService.validateInvite(inviteCode.trim())
      setInviteInfo({
        code: inviteCode.trim(),
        orgName: res.organization.name,
        orgSlug: res.organization.slug,
        orgId: res.organization.id,
        role: res.role,
      })
      setStep('join-confirm')
    } catch (e: any) {
      setError(e.message || 'Invalid invite code')
      setStep('join-enter')
    }
  }, [inviteCode])

  const handleAcceptInvite = useCallback(async () => {
    if (!inviteInfo) return
    setError('')
    setStep('submitting')
    try {
      await organizationService.acceptInvite(inviteInfo.code)
      window.location.assign('/dashboard')
    } catch (e: any) {
      setError(e.message || 'Failed to join organization')
      setStep('join-confirm')
    }
  }, [inviteInfo])

  const handleCreateOrg = useCallback(async () => {
    if (!orgName.trim()) {
      setError('Organization name is required')
      return
    }
    setError('')
    setStep('submitting')
    try {
      await organizationService.createOrganization({
        name: orgName.trim(),
        slug: orgSlug.trim() || undefined,
        description: orgDesc.trim() || undefined,
      })
      window.location.assign('/dashboard')
    } catch (e: any) {
      setError(e.message || 'Failed to create organization')
      setStep('create-form')
    }
  }, [orgName, orgSlug, orgDesc])

  const handleSignOut = async () => {
    await authService.logout()
    router.push('/login')
  }

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">AppKit</span>
      </div>

      <div className="w-full max-w-md">
        {/* Loading */}
        {step === 'loading' && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600" />
          </div>
        )}

        {/* Submitting */}
        {step === 'submitting' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Please wait…</p>
          </div>
        )}

        {/* Choose step */}
        {step === 'choose' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {firstName}!</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Let&apos;s set up your workspace to get started.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => { setError(''); setStep('join-enter') }}
                className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 text-left hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Join Organization</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter an invite code from a teammate</p>
              </button>

              <button
                onClick={() => { setError(''); setStep('create-form') }}
                className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 text-left hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create Organization</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start a new workspace from scratch</p>
              </button>
            </div>
          </div>
        )}

        {/* Join — enter code */}
        {step === 'join-enter' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8">
            <button
              onClick={() => { setError(''); setInviteCode(''); setStep('choose') }}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Join an Organization</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter the invite code you received from your admin.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleValidateInvite()}
                  placeholder="Paste your invite code here"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  autoFocus
                />
                {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
              </div>
              <button
                onClick={handleValidateInvite}
                disabled={!inviteCode.trim()}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
              >
                Validate Code
              </button>
            </div>
          </div>
        )}

        {/* Join — confirm */}
        {step === 'join-confirm' && inviteInfo && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8">
            <button
              onClick={() => { setError(''); setStep('join-enter') }}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Valid Invite</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">You&apos;ve been invited to join:</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Organization</span>
                <span className="font-medium text-gray-900 dark:text-white">{inviteInfo.orgName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Your Role</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">{inviteInfo.role}</span>
              </div>
            </div>

            {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              onClick={handleAcceptInvite}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Accept &amp; Join
            </button>
          </div>
        )}

        {/* Create organization */}
        {step === 'create-form' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8">
            <button
              onClick={() => { setError(''); setStep('choose') }}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Create Your Organization</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Set up your workspace. You can always update these later.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL identifier)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={orgSlug}
                    onChange={e => {
                      setSlugManuallyEdited(true)
                      setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }}
                    placeholder="acme-corp"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Auto-generated from name. Only lowercase letters, numbers and hyphens.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={orgDesc}
                  onChange={e => setOrgDesc(e.target.value)}
                  placeholder="What does your organization do?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <button
                onClick={handleCreateOrg}
                disabled={!orgName.trim()}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
              >
                Create Organization
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sign out */}
      {step !== 'loading' && step !== 'submitting' && (
        <button
          onClick={handleSignOut}
          className="mt-8 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Sign out
        </button>
      )}
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  )
}
