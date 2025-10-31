
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request:NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId1 = searchParams.get('userId1');
        const userId2 = searchParams.get('userId2');

        if (!userId1|| !userId2) {
            return NextResponse.json(
                 { error: 'Both userId1 and userId2 are required' },
                { status: 400 }
            )
        }
        let conversation = await prisma.conversation.findFirst({
            where:{type:"PRIVATE", AND:[
                {members:{some:{userId: userId1}}},
                {members:{some:{userId: userId2}}}
            ]}, include:{members: true}
        });
        if (!conversation) {
            return NextResponse.json({messages:[]})
        }
        const messages= await prisma.messages.findMany({
            where:{conversationId: conversation.id},
            orderBy:{createdAt:"asc"},

            include:{sender:{
                select:{id:true, name:true, email:true, image: true}
            }}
        })
        return NextResponse.json({messages})
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

export async function POST(request:NextRequest) {
    try {
        const body= await request.json();
        const {senderId, receiverId, text} =body;
        if (!senderId|| !receiverId || !text) {
            return NextResponse.json(
                { error: 'senderId, receiverId, and content are required' },
                { status: 400 }
            );
        }
        let conversation = await prisma.conversation.findFirst({
            where:{type:'PRIVATE',AND:[
                {members:{some:{userId: senderId}}},
                {members:{some:{userId: receiverId}}}
            ]}
        });
        if (!conversation) {
            conversation= await prisma.conversation.create({
                data:{type:'PRIVATE', members:{
                    create:[
                        {userId:senderId},
                        {userId:receiverId}
                    ]
                }}
            })
        }
        const message = await prisma.messages.create({
            data:{message:text, senderId,conversationId: conversation.id, isDeleted:false},
            include:{
                sender:{
                    select:{id:true, name:true,email: true, image:true}}
            }
        })
        return NextResponse.json({message},{status:201})
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json(
            { error: 'Failed to create message' },
            { status: 500 }
        );
    }
}