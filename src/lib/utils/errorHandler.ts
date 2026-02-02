import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiError } from '@/lib/errors/ApiError';

export async function withErrorHandling(
  handler: () => Promise<NextResponse>,
  context: string
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`${context} ApiError:`, error.message, error.details);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof z.ZodError) {
      console.error(`${context} ZodError:`, error.issues);
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error(`❌ ${context} UNEXPECTED ERROR:`, error);
    console.error('Error name:', error instanceof Error ? error.name : 'unknown');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'no stack trace');
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}
