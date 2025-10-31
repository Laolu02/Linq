import { PrismaClient } from "@prisma/client";
import { error, group } from "console";
import { NextRequest, NextResponse } from "next/server";

const prisma= new PrismaClient();
export async function POST(request:NextRequest) {
    try {
        const body = await request.json()
        const {name, description, creatorId, isPublic=true, avatar} =body;
        if (!name|| name.trim().length ==0) {
            return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
        }

        if (!creatorId) {
            return NextResponse.json({error: "Creator Id is required"}, {status:400});
        }

        if (name.trim().length > 50) {
      return NextResponse.json(
        { error: 'Group name must be 50 characters or less' },
        { status: 400 }
      );
    }

    if (description && description.trim().length > 200) {
      return NextResponse.json(
        { error: 'Description must be 200 characters or less' },
        { status: 400 }
      );
    }

    const creator = await prisma.users.findUnique({
        where:{id: creatorId}
    });
    if (!creator) {
        return NextResponse.json(
            {error: 'Creator not found'},
            {status:404}
        );
    }

    const group = await prisma.group.create({
        data:{
            name: name.trim(),
            description: description?.trim()|| null,
            avatar: avatar|| null,
            isPublic: Boolean(isPublic),
            creatorId:creatorId,
            members:{
                create:{
                    userId: creatorId,
                    role: 'ADMIN'
                }
            }
        },
        include:{
            creator:{
                select:{ id:true, name: true, email:true, image: true}
            },
            members:{
                include:{
                    user:{
                        select:{
                            id:true, name:true, email:true, image: true
                        }
                    }
                }
            }
        }
    });
    
    // await prisma.messages.create({
    //     data: {
    //     message: `${creator.name} created this group`,
    //     type: 'SYSTEM',
    //     senderId: creatorId,
    //     groupId: group.id
    //   }
    // })
     return NextResponse.json({ 
      message: 'Group created successfully',
      group 
    }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating group:', error);
    if (error === 'P2002') {
      return NextResponse.json(
        { error: 'A group with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create group. Please try again.' },
      { status: 500 }
    );
    }
};

export async function GET(request:NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId= searchParams.get('userId')
        const onlyPublic = searchParams.get('onlyPublic') === 'true';
        const search= searchParams.get('search')||"";

        const whereClause: any ={};

        if (onlyPublic) {
            whereClause.isPublic = true
        }

        if (userId && !onlyPublic) {
            whereClause.members={
                some:{userId: userId}
            };
        }

        if (search) {
            whereClause.OR=[
                {name:{contains: search, mode:'insentive'}},
            ]
        }

        const groups = await prisma.group.findMany({
            where: whereClause,
            include:{
                creator:{
                    select:{id: true, name: true, email:true, image:true}
                },
                members:{
                    select:{ userId: true, role: true}
                },
                messages:{
                    where:{isDeleted:false},
                    orderBy:{createdAt: 'desc'},take:1,
                    select:{message: true, createdAt: true, senderId: true}
                }
            },
            orderBy:{createdAt:'desc'}
        });
        const changedGroups= groups.map(group=>({
            id: group.id,
            name: group.name,
            description: group.description,
            avatar: group.avatar,
            isPublic: group.isPublic,
            creator: group.creator,
            memberCount: group.members.length,
            lastMessage: group.messages[0] || null,
            isMember: userId ? group.members.some(m => m.userId === userId) : false,
            createdAt: group.createdAt
        }));

        return NextResponse.json({ groups: changedGroups})
    } catch (error) {
        console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
    }
}