import { NextRequest, NextResponse } from 'next/server';
import { getLinkByCode, deleteLink } from '@/lib/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } | Promise<{ code: string }> }
) {
  // Handle the case where params might be a Promise
  const { code } = await Promise.resolve(params);
  try {
    const link = await getLinkByCode(code);

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: link.code,
      targetUrl: link.targetUrl,
      totalClicks: link.totalClicks,
      lastClickedAt: link.lastClickedAt,
      createdAt: link.createdAt,
    });
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } | Promise<{ code: string }> }
) {
  // Handle the case where params might be a Promise
  const { code } = await Promise.resolve(params);
  console.log(`DELETE /api/links/${code} - Received delete request`);

  if (!code || typeof code !== 'string' || code.length === 0) {
    console.error('Invalid code parameter:', code);
    return NextResponse.json(
      { error: 'Invalid link code' },
      { status: 400 }
    );
  }

  try {
    console.log(`Attempting to delete link with code: ${code}`);
    const deleted = await deleteLink(code);

    if (!deleted) {
      console.log(`Link with code ${code} not found`);
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    console.log(`Successfully deleted link with code: ${code}`);
    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully',
      code,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error(`Error deleting link with code ${code}:`, error);
    
    // Handle specific error types if needed
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Database operation timed out' },
          { status: 504 } // Gateway Timeout
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to delete link',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
    // For non-Error objects
    return NextResponse.json(
      { 
        error: 'An unknown error occurred while deleting the link',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}