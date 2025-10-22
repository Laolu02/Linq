import { NextResponse } from 'next/server'
import prisma from '@/prisma/connection.prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const {name,email,password} = await request.json()
        if (!name|| !email|| !password) {
            return new NextResponse('Missing required fields', { status: 400 })
        }
        const hashedPassword = await bcrypt.hash(password,10)
        const user = await prisma.users.create({
            data:{name,email, password:hashedPassword , image:`/dp.jpeg`},
        })
        const {password:_, ...userWithoutPass} =user
        return NextResponse.json(userWithoutPass, { status: 201 })
    } catch (error:any) {
        if (error.code === 'P2002') { 
            return new NextResponse('User with this email already exists', { status: 409 })
        }
        console.error('Registration error:', error)
        return new NextResponse('Internal Server Error during registration', { status: 500 })
    }
}