const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({});

async function main() {
    const email = 'dwaitser@gmail.com';
    const password = '1234';
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('Upserting admin user...');
    const admin = await prisma.admin.upsert({
        where: { email },
        update: {
            passwordHash: passwordHash
        },
        create: {
            email,
            passwordHash: passwordHash
        },
    });

    console.log('Admin user created/updated successfully:', admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
