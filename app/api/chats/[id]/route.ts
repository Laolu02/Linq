import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
   const id = params.id;
    if (!id) {
    return NextResponse.json({ error: 'Group ID is missing' }, { status: 400 });
  }
  try {
    const group = await prisma.group.findUnique({
      where: { id:id },
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true }
        },
        members: true
      }
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}