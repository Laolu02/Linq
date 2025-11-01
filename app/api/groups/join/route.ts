import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


const prisma= new PrismaClient();

export async function POST(request:NextRequest) {
    try {
        const body = await request.json();
        const {groupId, userId}= body;

         console.log('User attempting to join group:', { groupId, userId });

        if (!groupId||!userId) {
            return NextResponse.json(
                { error: 'groupId and userId are required' },
                { status: 400 }
            );
        }

        const user= await prisma.users.findUnique({
            where: {id:userId},
            select:{id:true, name:true, email:true,image:true}
        });
        if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { userId: userId }
        }
      }
    });
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }
    if (!group.isPublic) {
      return NextResponse.json(
        { error: 'This group is private. You need an invitation to join.' },
        { status: 403 }
      );
    }
    if (group.members.length > 0) {
      return NextResponse.json(
        { error: 'You are already a member of this group' },
        { status: 400 }
      );
    }
    const groupmember = await prisma.groupMember.create({
        data:{groupId: groupId, userId: userId, role:'MEMBER'},
        include:{
            user:{
                select:{id:true, name:true, email:true,image:true}
            },
            group:{
                select:{id:true, name:true, description:true,avatar:true}
            }
        }
    });
    // await prisma.messages.create({
    //     data:{
    //         message:`${user.name} joined the group`,
    //         senderId: userId,
    //         groupId: groupId
    //     }
    // })

    console.log('User successfully joined group:', groupmember.groupId);

    return NextResponse.json({
        message:'Joined Group successfully',
        groupmember
    }, {status:201})
    } catch (error: unknown) {
        console.error('Error joinin group:', error);
        if (typeof error === 'object' && 
        error !== null && 
        'code' in error && 
        error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You are already a member of this group' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to join group. Please try again.' },
      { status: 500 }
    );
    }
}

export async function DELETE (request:NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
    const groupId = searchParams.get('groupId');
    const userId = searchParams.get('userId');

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: 'groupId and userId are required' },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
        where:{id:userId},
        select:{name:true}
    })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    const member= await prisma.groupMember.findUnique({
        where:{
            groupId_userId:{groupId,userId}
        }
    })
    if (!member) {
        return NextResponse.json(
        { error: 'You are not a member of this group' },{ status: 400 }
      );
    }
    const group = await prisma.group.findUnique({
        where:{id:groupId},
        include:{ members:{where:{role:'ADMIN'}}}
    })
    if (member.role === 'ADMIN' && group?.members.length===1) {
        return NextResponse.json(
        { error: 'Please assign another admin before leaving or delete the group.' },
        { status: 400 }
      );
    }

    await prisma.groupMember.delete({
        where:{
            groupId_userId:{groupId,userId}
        }
    })
    return NextResponse.json({
        message:'Left group Successfully'
    })
    } catch (error) {
        console.error('Error leaving group:', error);
    return NextResponse.json(
      { error: 'Failed to leave group' },
      { status: 500 }
    );
    }
}