import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.property.deleteMany({});
  console.log('🗑️ Старые объекты удалены');

  const properties = [
    {
      title: 'Уютная квартира в центре Варшавы',
      city: 'Warszawa',
      district: 'Śródmieście',
      type: 'APARTMENT',
      rooms: 2,
      price: 3500,
      area: 45,
      floor: 3,
      totalFloors: 5,
      balcony: true,
      parking: true,
      pets: false,
      conditioner: true,
      terrace: false,
      address: 'ul. Marszałkowska 12, Warszawa',
      photos: 'https://picsum.photos/400/300?random=1',
      description: 'Уютная квартира в центре Варшавы',
    },
    {
      title: 'Уютная квартира в центре Кракова',
      city: 'Kraków',
      district: 'Stare Miasto',
      type: 'APARTMENT',
      rooms: 3,
      price: 4200,
      area: 65,
      floor: 2,
      totalFloors: 4,
      balcony: true,
      terrace: false,
      parking: false,
      pets: true,
      conditioner: false,
      address: 'ul. Floriańska 25, Kraków',
      photos: 'https://picsum.photos/400/300?random=2',
      description: 'Просторная квартира в историческом центре',
    },
    {
      title: 'Уютная квартира в центре врокслава',
      city: 'Wrocław',
      district: 'Krzyki',
      type: 'HOUSE',
      rooms: 4,
      price: 5500,
      area: 120,
      floor: 1,
      totalFloors: 2,
      balcony: false,
      terrace: true,
      parking: true,
      pets: true,
      conditioner: false,
      address: 'ul. Legnicka 50, Wrocław',
      photos: 'https://picsum.photos/400/300?random=3',
      description: 'Дом с террасой и парковкой',
    },
  ];

  for (const property of properties) {
    await prisma.property.create({ data: property });
  }

  console.log('✅ Seed завершён: создано 3 объекта');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
