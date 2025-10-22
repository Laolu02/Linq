import { PrismaClient } from "@prisma/client";

const prismaClientSinglton = () => {
    return new PrismaClient();
}

type PrismaClientSinglton = ReturnType<typeof prismaClientSinglton>;

const globalForPrisma= globalThis as unknown as {
    prisma: PrismaClientSinglton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSinglton();



if(process.env.NODE !== "production") globalForPrisma.prisma = prisma;
export default prisma;