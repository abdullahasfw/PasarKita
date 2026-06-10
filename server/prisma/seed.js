import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'kendaraan' },
      update: {},
      create: { name: 'Kendaraan', slug: 'kendaraan', icon: 'car' },
    }),
    prisma.category.upsert({
      where: { slug: 'elektronik' },
      update: {},
      create: { name: 'Elektronik', slug: 'elektronik', icon: 'laptop' },
    }),
    prisma.category.upsert({
      where: { slug: 'furnitur' },
      update: {},
      create: { name: 'Furnitur', slug: 'furnitur', icon: 'sofa' },
    }),
    prisma.category.upsert({
      where: { slug: 'alat-berat' },
      update: {},
      create: { name: 'Alat Berat', slug: 'alat-berat', icon: 'tractor' },
    }),
  ]);
  console.log(`Created ${categories.length} categories`);

  // Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pasarkita.id' },
    update: {},
    create: {
      name: 'Admin PasarKita',
      email: 'admin@pasarkita.id',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      phone: '081234567890',
    },
  });
  console.log('Created admin user');

  // Seller User
  const sellerPassword = await bcrypt.hash('seller123', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@pasarkita.id' },
    update: {},
    create: {
      name: 'Toko Pemda Jabar',
      email: 'seller@pasarkita.id',
      password: sellerPassword,
      role: 'SELLER',
      isVerified: true,
      phone: '082345678901',
      address: 'Gedung Sate, Bandung',
      latitude: -6.902481,
      longitude: 107.61881,
    },
  });
  console.log('Created seller user');

  // Buyer User
  const buyerPassword = await bcrypt.hash('buyer123', 12);
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@pasarkita.id' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'buyer@pasarkita.id',
      password: buyerPassword,
      role: 'BUYER',
      isVerified: true,
      phone: '083456789012',
      address: 'Jl. Merdeka No 1, Bandung',
      latitude: -6.914744,
      longitude: 107.60981,
    },
  });
  console.log('Created buyer user');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
