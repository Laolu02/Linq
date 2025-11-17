import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
   const id = params.id;
   console.log("Looking up user with ID:", id);
    if (!id) {
    return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
  }
  try {
    const user = await prisma.users.findUnique({
      where: { id:id },
      select:{
        id:true, name: true,email:true, image:true, isOnline: true, lastSeen:true, createdAt: true,
        _count:{
            select:{ sentMessages:true, conversations:true,groupMemberships:true, createdGroups:true}
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const User = {
        id: user.id,
      name: user.name,
      email: user.email,
      image: user.image, 
      avatar: user.image,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      stats: {
        messagesSent: user._count.sentMessages,
        conversations: user._count.conversations,
        groupsJoined: user._count.groupMemberships,
        groupsCreated: user._count.createdGroups
      }
    }

    return NextResponse.json({user:User});
  } catch (error) {
    console.error('Error fetching user:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch user',
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
    const userId = params.id;
    const body = await request.json();

    console.log('Updating user:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { name , image, } = body;


    const updateData: Prisma.UsersUpdateInput = {};
    if (name !== undefined) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image || null;


    if (name) {
      const existingUser = await prisma.users.findFirst({
        where:{ name: name.trim()}
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: 'Name is already taken' },
          { status: 409 }
        );
      }
    }

   
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        ...updatedUser,
        image: updatedUser.image
      }
    });

  } catch (error: unknown) {
    console.error('Error updating user:', error);
    
   
    if (typeof error === 'object' && 
        error !== null && 
        'code' in error && 
        error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}


export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const userId = params.id;
    const body = await request.json();

    console.log('Updating user status:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { isOnline } = body;

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json(
        { error: 'isOnline must be a boolean' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: new Date()
      },
      select: {
        id: true,
        name: true,
        isOnline: true,
        lastSeen: true
      }
    });

    return NextResponse.json({
      message: 'Status updated',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}