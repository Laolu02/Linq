import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest,
    context: { params: Promise<{ id: string }> }) {
    try {
      const params = await context.params;
      const messageId = params.id;

      if (!messageId) {
        return NextResponse.json(
          { error: "Message ID is required" },
          { status: 400 }
        );
      }
      const message = await prisma.messages.findUnique({
        where: { id: messageId },
        include: {
          sender: {
            select: { id: true, name: true, email: true, image: true },
          },
          conversation: {
            include: {
              members: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true, image: true },
                  },
                },
              },
            },
          },
        },
      });
      if (!message) {
        return NextResponse.json(
          { error: "Message not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      return NextResponse.json(
        { error: "Failed to fetch message" },
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
    const messageId = params.id;
    const body = await request.json();
    const { message, userId } = body;

    if (!messageId || !message || !userId) {
      return NextResponse.json(
        { error: 'Message ID, content, and userId are required' },
        { status: 400 }
      );
    }
    const existingMessage = await prisma.messages.findUnique({
      where: { id: messageId }
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (existingMessage.senderId !== userId) {
      return NextResponse.json(
        { error: 'You can only edit your own messages' },
        { status: 403 }
      );
    }
    const updatedMessage = await prisma.messages.update({
      where: { id: messageId },
      data: {
        message,
        isEdited: true
      },
      include: {
        sender: {
          select: { id: true,name: true, email: true,image: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Message updated successfully',
      data: updatedMessage
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
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
    const messageId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'Message ID and userId are required' },
        { status: 400 }
      );
    }
    const existingMessage = await prisma.messages.findUnique({
      where: { id: messageId }
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    if (existingMessage.senderId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      );
    }
    await prisma.messages.update({
      where: { id: messageId },
      data: { isDeleted: true }
    });

    return NextResponse.json({
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}