import { Prisma, PrismaClient } from "@prisma/client";
//import prisma from "@/prisma/connection.prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET (request:NextRequest) {
   try {
    console.log('Fetching all groups from database...');

     const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const includePrivate = searchParams.get('includePrivate') === 'true';
    const search = searchParams.get('search') || '';
    console.log('Query params:', { userId, includePrivate, search });


    const whereClause: Prisma.GroupWhereInput ={};
    if (!includePrivate) {
        whereClause.isPublic = true;
    }
    if (search) {
      whereClause.OR = [
       { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    const groups = await prisma.group.findMany({
        where: whereClause,
        include:{
            creator:{
                select:{ id:true, name:true, email:true, image:true}
            },
            members:{
                include:{
                    user:{
                        select:{id:true, name:true, email:true, image:true}
                    }
                }
            },
            messages:{
                where:{isDeleted:false},
                orderBy:{createdAt:'desc'},
                take:1,
                select:{id:true, message:true, createdAt:true, senderId:true,
                    sender:{select:{name:true}},
                },
            },
            _count:{
                select:{ members:true, messages:true}
            }
        },
        orderBy:[{updatedAt:'desc'},{createdAt:'desc'}]
    });

     console.log(`Found ${groups.length} groups`);
    const changeGroup = groups.map(group =>{
        const isMember =userId 
        ? group.members.some(m => m.userId === userId)
        : false;

      const userRole = userId
        ? group.members.find(m => m.userId === userId)?.role
        : null;

    return {
        id: group.id,
        name: group.name,
        description: group.description,
        avatar: group.avatar,
        isPublic: group.isPublic,
        creator: group.creator,
        creatorId: group.creatorId,
        memberCount: group._count.members,
        messageCount: group._count.messages,
        members: group.members.map(m => ({
          userId: m.userId,
          role: m.role,
          joinedAt: m.joinedAt,
          user: m.user
        })),
        lastMessage: group.messages[0] ? {
          id: group.messages[0].id,
          content: group.messages[0].message,
          createdAt: group.messages[0].createdAt,
          senderId: group.messages[0].senderId,
          senderName: group.messages[0].sender.name
        } : null,
        isMember,
        userRole,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt
      };    
    });

    return NextResponse.json({
        groups: changeGroup,
        count: changeGroup.length,
        timeStamp: new Date().toISOString()
    })
   } catch (error) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch groups',
        details: error instanceof Error ? error.message : 'Unknown error',
        groups: [],
        count: 0
      },
      { status: 500 }
    );
   } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'stats') {
      // Get database statistics
      const totalGroups = await prisma.group.count();
      const publicGroups = await prisma.group.count({ where: { isPublic: true } });
      const privateGroups = await prisma.group.count({ where: { isPublic: false } });
      const totalMembers = await prisma.groupMember.count();
      const totalMessages = await prisma.messages.count({ where: { groupId: { not: null } } });

      // Get sample groups
      const sampleGroups = await prisma.group.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          isPublic: true,
          createdAt: true,
          _count: {
            select: {
              members: true,
              messages: true
            }
          }
        }
      });

      return NextResponse.json({
        message: 'Group statistics',
        stats: {
          totalGroups,
          publicGroups,
          privateGroups,
          totalMembers,
          totalMessages
        },
        sampleGroups
      });
    }

    if (action === 'test') {
      // Test database connection
      await prisma.$connect();
      const groupCount = await prisma.group.count();
      
      return NextResponse.json({
        message: 'Database connection successful',
        groupCount,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { 
        error: 'Operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}