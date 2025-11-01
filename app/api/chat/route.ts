
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request:NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
       const groupId = searchParams.get("groupId")
        if (!groupId) {
            return NextResponse.json(
                 { error: 'groupId is required' },
                { status: 400 }
            )
        }
        const messages= await prisma.messages.findMany({
            where:{groupId: groupId, isDeleted:false},
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
        const {senderId, groupId, text} =body;
        if (!senderId|| !groupId || !text) {
            return NextResponse.json(
                { error: 'senderId, groupId, and content are required' },
                { status: 400 }
            );
        }
        const members = await prisma.groupMember.findUnique({
            where:{
                groupId_userId:{groupId, userId:senderId}
            }
        });
        if (!members) {
            return NextResponse.json(
                { error: 'User is not a member of this group' },
                { status: 403 }
            );
        }
        const message = await prisma.messages.create({
            data:{message:text, senderId, groupId, isDeleted:false},
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