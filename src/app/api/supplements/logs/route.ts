import { NextResponse } from 'next/server';
import { SupplementRepository } from '@/lib/database/repositories/supplementRepository';

// PUT - update a log entry's timestamp
export async function PUT(request: Request) {
  const repo = new SupplementRepository();

  try {
    const body = await request.json();
    const { id, takenAt } = body;

    // Validation
    if (!id || !takenAt) {
      return NextResponse.json({ error: 'ID and takenAt are required' }, { status: 400 });
    }

    // Validate ISO timestamp format
    if (isNaN(Date.parse(takenAt))) {
      return NextResponse.json({ error: 'Invalid timestamp format' }, { status: 400 });
    }

    repo.updateSupplementLog(id, takenAt);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - remove a specific log entry
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const repo = new SupplementRepository();

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  try {
    repo.deleteSupplementLog(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
