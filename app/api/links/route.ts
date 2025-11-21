import { NextRequest, NextResponse } from 'next/server';
import { createLink, getAllLinks } from '@/lib/queries';
import { urlSchema, codeSchema, sanitizeInput } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetUrl = sanitizeInput(body.targetUrl || '');
    const customCode = body.customCode ? sanitizeInput(body.customCode) : undefined;
    
    // Validate URL
    const urlValidation = urlSchema.safeParse(targetUrl);
    if (!urlValidation.success) {
      return NextResponse.json(
        { error: 'Please enter a valid URL (e.g., https://example.com)' },
        { status: 400 }
      );
    }

    // Validate custom code if provided
    if (customCode) {
      const codeValidation = codeSchema.safeParse(customCode);
      if (!codeValidation.success) {
        const errorMessage = codeValidation.error.issues[0]?.message || 'Invalid custom code';
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
    }

    // Ensure URL has a protocol
    let processedUrl = targetUrl;
    if (!/^https?:\/\//i.test(targetUrl)) {
      processedUrl = `https://${targetUrl}`;
    }

    const link = await createLink(processedUrl, customCode);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return NextResponse.json(
      {
        code: link.code,
        targetUrl: link.targetUrl,
        shortUrl: `${baseUrl}/${link.code}`,
        createdAt: link.createdAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'CODE_EXISTS') {
      return NextResponse.json(
        { error: 'This code is already in use. Please try a different one.' },
        { status: 409 }
      );
    }
    
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Failed to create link. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    
    const allLinks = await getAllLinks(search);

    return NextResponse.json({
      links: allLinks.map(link => ({
        code: link.code,
        targetUrl: link.targetUrl,
        totalClicks: link.totalClicks,
        lastClickedAt: link.lastClickedAt,
        createdAt: link.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}