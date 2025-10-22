import { NextResponse } from "next/server";
import prisma from "@/prisma/connection.prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }
        const users = await prisma.users.findMany({
            select:{id:true, name:true, image: true}
        })
        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching users:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}