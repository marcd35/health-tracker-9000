import { NextResponse } from 'next/server';
import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';
import { withErrorHandling } from '@/lib/utils/errorHandler';
import { ValidationError } from '@/lib/errors/ApiError';
import { z } from 'zod';

const PaginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// GET - list supplement logs with pagination
export async function GET(request: Request) {
  const repo = new SupplementRepository();
  const { searchParams } = new URL(request.url);

  return withErrorHandling(async () => {
    const params = PaginationSchema.parse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    });

    const result = repo.getAllSupplementLogs(
      params.startDate,
      params.endDate,
      params.limit,
      params.offset
    );

    return NextResponse.json({
      data: result.data,
      pagination: {
        total: result.total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < result.total,
      },
    });
  }, 'GET /api/supplements/logs');
}

// PUT - update a log entry's timestamp
export async function PUT(request: Request) {
  const repo = new SupplementRepository();

  return withErrorHandling(async () => {
    const body = await request.json();
    const { id, takenAt } = body;

    // Validation
    if (!id || !takenAt) {
      throw new ValidationError('ID and takenAt are required');
    }

    // Validate ISO timestamp format
    if (isNaN(Date.parse(takenAt))) {
      throw new ValidationError('Invalid timestamp format');
    }

    repo.updateSupplementLog(id, takenAt);
    return NextResponse.json({ success: true });
  }, 'PUT /api/supplements/logs');
}

// DELETE - remove a specific log entry
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const repo = new SupplementRepository();

  return withErrorHandling(async () => {
    if (!id) {
      throw new ValidationError('ID required');
    }

    repo.deleteSupplementLog(id);
    return NextResponse.json({ success: true });
  }, 'DELETE /api/supplements/logs');
}
