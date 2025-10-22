import { NextResponse } from 'next/server'
import prisma from '@/prisma/connection.prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const {email,password} = await request.json()
        if ( !email|| !password) {
            return new NextResponse('Missing required fields', { status: 400 })
        }
        const user = await prisma.users.findUnique({
            where:{email},
        });
        if (!user || !user.password) {
        return new NextResponse('Invalid email or password', { status: 401 });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
        return new NextResponse('Invalid email or password', { status: 401 });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {password:_, ...userWithoutPass} = user
        return NextResponse.json(userWithoutPass, { status: 200 })
    } catch (error:unknown) {
        if (error === 'P2002') { 
            return new NextResponse('User with this email already exists', { status: 409 })
        }
        console.error('Registration error:', error)
        return new NextResponse('Internal Server Error during registration', { status: 500 })
    }
}