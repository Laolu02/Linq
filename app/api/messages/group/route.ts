import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.messages.findMany({
      where: {
        groupId: groupId,
        isDeleted: false
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        sender: {
          select: { id: true,name: true,email: true, image: true}
        }
      }
    });

    return NextResponse.json({ messages:messages });
  } catch (error) {
    console.error('Error fetching group messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group messages' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, groupId, message } = body;

    if (!senderId || !groupId || !message) {
      return NextResponse.json(
        { error: 'senderId, groupId, and content are required' },
        { status: 400 }
      );
    }
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: senderId
        }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'User is not a member of this group' },
        { status: 403 }
      );
    }
    const newMessage = await prisma.messages.create({
      data: { message:message, isDeleted:false, isEdited:false, sender:{connect:{id:senderId}}, chatRoom:{connect:{id:groupId}},},
      include: {
        sender: {
         select: { id: true,name: true,email: true, image: true}
        }
      }
    });

    return NextResponse.json({ newMessage }, { status: 201 });
  } catch (error) {
    console.error('Error creating group message:', error);
    return NextResponse.json(
      { error: 'Failed to create group message' },
      { status: 500 }
    );
  }
}