// app/api/chats/route.ts
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
    const privateConversations = await prisma.conversation.findMany({
      where: {
        type: 'PRIVATE',
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {id: true,name: true,email: true,image: true,isOnline: true}
            }
          }
        },
        messages: {
          where: {
            isDeleted: false
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            message: true,createdAt: true,senderId: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const groupChats = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        members: {
          select: {
            userId: true
          }
        },
        messages: {
          where: {
            isDeleted: false
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          select: {
            message: true,
            createdAt: true,
            senderId: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format private conversations
    const formattedPrivateChats = privateConversations.map(conv => {
      const otherUser = conv.members.find(member => member.userId !== userId)?.user;
      const lastMessage = conv.messages[0];
      
      // Count unread messages
      const unreadCount = 0; // TODO: Implement read receipts tracking

      return {
        id: conv.id,
        type: 'private',
        otherUser: otherUser || null,
        lastMessage: lastMessage || null,
        unreadCount,
        updatedAt: conv.updatedAt
      };
    }).filter(chat => chat.otherUser !== null);

    // Format group chats
    const formattedGroupChats = groupChats.map(group => {
      const lastMessage = group.messages[0];
      
      // Count unread messages
      const unreadCount = 0; // TODO: Implement read receipts tracking

      return {
        id: group.id,
        type: 'group',
        name: group.name,
        description: group.description,
        avatar: group.avatar,
        memberCount: group.members.length,
        lastMessage: lastMessage || null,
        unreadCount,
        updatedAt: group.updatedAt
      };
    });

    // Combine and sort by last activity
    const allChats = [...formattedPrivateChats, ...formattedGroupChats].sort((a, b) => {
      const dateA = a.lastMessage?.createdAt || a.updatedAt;
      const dateB = b.lastMessage?.createdAt || b.updatedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return NextResponse.json({ chats: allChats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// Optional: Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, otherUserId, type = 'PRIVATE' } = body;

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { error: 'userId and otherUserId are required' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: 'PRIVATE',
        AND: [
          { members: { some: { userId: userId } } },
          { members: { some: { userId: otherUserId } } }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (existingConversation) {
      return NextResponse.json({ conversation: existingConversation });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: 'PRIVATE',
        members: {
          create: [
            { userId: userId },
            { userId: otherUserId }
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}