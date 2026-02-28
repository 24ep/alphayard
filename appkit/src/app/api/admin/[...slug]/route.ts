// Internal rewrite: /api/admin/* → /api/v1/admin/*
// Uses NextResponse.rewrite() for zero-cost internal routing (no HTTP fetch)
import { NextRequest, NextResponse } from 'next/server'

function rewriteToV1(request: NextRequest, slug: string[]) {
  const url = request.nextUrl.clone()
  url.pathname = `/api/v1/admin/${slug.join('/')}`
  return NextResponse.rewrite(url)
}

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return rewriteToV1(request, params.slug)
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return rewriteToV1(request, params.slug)
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return rewriteToV1(request, params.slug)
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return rewriteToV1(request, params.slug)
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string[] } }) {
  return rewriteToV1(request, params.slug)
}
