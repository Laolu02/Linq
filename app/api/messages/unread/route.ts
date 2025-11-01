import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        members: { some: { userId }}
      },
      include: {
        members: {
          where: { userId }
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId }, isDeleted: false
              }
            }
          }
        }
      }
    });
    const unreadCounts = conversations.map(conv => {
      const userMember = conv.members[0];
      //const lastReadAt = userMember?.lastReadAt || new Date(0);
      
      return {
        conversationId: conv.id,
        unreadCount: conv._count.messages 
      };
    });

    const totalUnread = unreadCounts.reduce((sum, c) => sum + c.unreadCount, 0);

    return NextResponse.json({
      totalUnread,
      conversations: unreadCounts
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, conversationId } = body;

    if (!userId || !conversationId) {
      return NextResponse.json(
        { error: 'userId and conversationId are required' },
        { status: 400 }
      );
    }

    await prisma.conversationMember.updateMany({
      where: {
        conversationId,
        userId
      },
      data: {
        lastReadAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}