// Legal Content API Service for Mobile
import apiClient from './apiClient';

export interface LegalDocument {
  id: string;
  type: string;
  slug: string;
  title: string;
  content: string;
  contentFormat: string;
  summary?: string;
  version: string;
  versionDate: string;
  effectiveDate: string;
  lastUpdated: string;
  language: string;
  country?: string;
  status: 'draft' | 'published' | 'archived';
  isRequiredAcceptance: boolean;
  requiresReacceptance: boolean;
  displayOrder: number;
  showInApp: boolean;
  showInFooter: boolean;
  sections?: LegalSection[];
}

export interface LegalSection {
  id: string;
  documentId: string;
  title: string;
  content: string;
  sortOrder: number;
  isCollapsible: boolean;
}

export interface UserAcceptance {
  id: string;
  userId: string;
  documentId: string;
  documentType: string;
  documentVersion: string;
  acceptedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface DeveloperDoc {
  id: string;
  category: string;
  slug: string;
  title: string;
  content: string;
  contentFormat: string;
  excerpt?: string;
  parentId?: string;
  sortOrder: number;
  tags?: string[];
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime?: number;
  status: 'draft' | 'published' | 'archived' | 'deprecated';
  isFeatured: boolean;
  version: string;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// PUBLIC LEGAL DOCUMENTS
// =====================================================

/**
 * Get all published legal documents
 */
export async function getPublishedDocuments(): Promise<LegalDocument[]> {
  const response = await apiClient.get('/legal/documents');
  return response.data.documents || [];
}

/**
 * Get a specific legal document by slug
 */
export async function getDocumentBySlug(slug: string): Promise<LegalDocument> {
  const response = await apiClient.get(`/legal/documents/${slug}`);
  return response.data.document;
}

/**
 * Get Terms of Service
 */
export async function getTermsOfService(): Promise<LegalDocument> {
  const response = await apiClient.get('/legal/terms');
  return response.data.document;
}

/**
 * Get Privacy Policy
 */
export async function getPrivacyPolicy(): Promise<LegalDocument> {
  const response = await apiClient.get('/legal/privacy');
  return response.data.document;
}

/**
 * Get Community Guidelines
 */
export async function getCommunityGuidelines(): Promise<LegalDocument> {
  const response = await apiClient.get('/legal/community-guidelines');
  return response.data.document;
}

// =====================================================
// USER ACCEPTANCES
// =====================================================

/**
 * Get user's current document acceptances
 */
export async function getUserAcceptances(): Promise<UserAcceptance[]> {
  const response = await apiClient.get('/legal/acceptances');
  return response.data.acceptances || [];
}

/**
 * Accept a legal document
 */
export async function acceptDocument(documentId: string): Promise<void> {
  await apiClient.post('/legal/accept', { documentId });
}

/**
 * Get pending documents that require user acceptance
 */
export async function getPendingAcceptances(): Promise<LegalDocument[]> {
  const response = await apiClient.get('/legal/pending');
  return response.data.documents || [];
}

/**
 * Check if user has accepted a specific document type
 */
export async function checkAcceptance(type: string): Promise<{ accepted: boolean; acceptance?: UserAcceptance }> {
  const response = await apiClient.get(`/legal/check/${type}`);
  return response.data;
}

// =====================================================
// DEVELOPER DOCUMENTATION
// =====================================================

/**
 * Get all published developer docs
 */
export async function getDeveloperDocs(category?: string): Promise<DeveloperDoc[]> {
  const params = category ? { category } : {};
  const response = await apiClient.get('/legal/developer-docs', { params });
  return response.data.documents || [];
}

/**
 * Get a specific developer doc by slug
 */
export async function getDeveloperDocBySlug(slug: string): Promise<DeveloperDoc> {
  const response = await apiClient.get(`/legal/developer-docs/${slug}`);
  return response.data.document;
}

/**
 * Submit feedback on a developer doc
 */
export async function submitDocFeedback(
  documentId: string,
  helpful: boolean,
  comment?: string
): Promise<void> {
  await apiClient.post(`/legal/developer-docs/${documentId}/feedback`, {
    helpful,
    comment,
  });
}

// Export all functions
export const legalApi = {
  // Public documents
  getPublishedDocuments,
  getDocumentBySlug,
  getTermsOfService,
  getPrivacyPolicy,
  getCommunityGuidelines,
  
  // User acceptances
  getUserAcceptances,
  acceptDocument,
  getPendingAcceptances,
  checkAcceptance,
  
  // Developer docs
  getDeveloperDocs,
  getDeveloperDocBySlug,
  submitDocFeedback,
};

export default legalApi;
