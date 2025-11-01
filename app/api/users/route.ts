import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/connection.prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { ObjectId } from "bson";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const searchParams = request.nextUrl.searchParams;
        const currentUserId = searchParams.get('currentUserId');
        const search = searchParams.get('search') || '';

        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause:any ={};
        if (currentUserId) {
      whereClause.id = { not: { id: new ObjectId(currentUserId).toString() },};
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
        const users = await prisma.users.findMany({
            where: whereClause,
            select:{id:true, name:true, image: true,email:true, isOnline:true,lastSeen:true},
            orderBy:[{isOnline:'desc'}, {lastSeen:'desc'},{name:'asc'}]
        })
        const UsersChan = users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
        }));
        return NextResponse.json({users: UsersChan});
    } catch (error) {
        console.error('Error fetching users:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}