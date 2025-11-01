import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request:NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
    const userId1 = searchParams.get('userId1');
    const userId2 = searchParams.get('userId2');

    if (!userId1 || !userId2) {
      return NextResponse.json(
        { error: 'Both userId1 and userId2 are required' },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findFirst({
        where:{type:'PRIVATE',
            AND:[
                {members:{some:{userId:userId1}}},
                {members:{some:{userId:userId2}}},
            ]
        },
        include:{members:true}
    });
    if (!conversation) {
      return NextResponse.json({ messages: [] });
    }
    const message = await prisma.messages.findMany({
        where:{conversationId:conversation.id, isDeleted:false},
        orderBy:{createdAt:'asc'},
        include:{
            sender:{
                select:{ id:true, name:true, email:true, image:true}
            }
        }
    });
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request:NextRequest) {
    try {
        const body = await request.json();
        const {senderId , receiverId, message}= body;
        if (!senderId || !receiverId || !message) {
      return NextResponse.json(
        { error: 'senderId, receiverId, and content are required' },
        { status: 400 }
      );
    }
    let conversation = await prisma.conversation.findFirst({
        where: {
        type: 'PRIVATE',
        AND: [
          { members: { some: { userId: senderId } } },
          { members: { some: { userId: receiverId } } }
        ]
      }
    });
    if (!conversation) {
        conversation= await prisma.conversation.create({
            data:{ type:"PRIVATE",
                members:{
                    create:[{userId: senderId}, {userId: receiverId}]
                }
            }
        });
    }
    const newMessages = await prisma.messages.create({
        data:{ message:message, senderId,receiverId, conversationId:conversation.id, isDeleted:false, isEdited:false,},
        include:{
            sender:{
                select:{id:true, name:true, email:true, image:true}
            }
        }
    });
    return NextResponse.json(newMessages)
    } catch (error) {
        console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
    }
}