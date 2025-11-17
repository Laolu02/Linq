import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GroupProfile {
  name: string;
  description: string | null;
  avatar: string | null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const groupId = params.id;
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    console.log('Fetching group profile:', groupId, 'for user:', userId);

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isOnline: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        _count: {
          select: {
            members: true,
            messages: true
          }
        }
      }
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }
    const isMember = userId 
      ? group.members.some(m => m.userId === userId)
      : false;

    const userMembership = userId
      ? group.members.find(m => m.userId === userId)
      : null;

    if (!group.isPublic && !isMember) {
      return NextResponse.json(
        { error: 'This is a private group. You need to be a member to access it.' },
        { status: 403 }
      );
    }

    const groupProfile = {
      id: group.id,
      name: group.name,
      description: group.description,
      avatar: group.avatar,
      isPublic: group.isPublic,
      creator: {
        id: group.creator.id,
        name: group.creator.name,
        avatar: group.creator.image
      },
      memberCount: group._count.members,
      messageCount: group._count.messages,
      members: group.members.map(m => ({
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        user: {
          id: m.user.id,
          name: m.user.name,
          avatar: m.user.image,
          isOnline: m.user.isOnline
        }
      })),
      createdAt: group.createdAt,
      isMember,
      userRole: userMembership?.role || null
    };

    return NextResponse.json({ group: groupProfile });

  } catch (error) {
    console.error('Error fetching group profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch group profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const groupId = params.id;
    const body = await request.json();
    const { userId, name, description, avatar } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can update group details' },
        { status: 403 }
      );
    }
    const updateData: Partial<GroupProfile> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (avatar !== undefined) updateData.avatar = avatar || null;

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
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

    return NextResponse.json({
      message: 'Group updated successfully',
      group: updatedGroup
    });

  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const groupId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can delete the group' },
        { status: 403 }
      );
    }
    await prisma.group.delete({
      where: { id: groupId }
    });

    return NextResponse.json({
      message: 'Group deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}