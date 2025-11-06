import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@qlmts.com' },
    update: {},
    create: {
      email: 'admin@qlmts.com',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });

  // Create QC Manager
  const qcPassword = await bcrypt.hash('QCManager@123', 10);
  const qcManager = await prisma.user.upsert({
    where: { email: 'qc.manager@qlmts.com' },
    update: {},
    create: {
      email: 'qc.manager@qlmts.com',
      password: qcPassword,
      name: 'QC Manager',
      role: 'QC_MANAGER',
    },
  });

  // Create Lab Technician
  const labTechPassword = await bcrypt.hash('LabTech@123', 10);
  const labTech = await prisma.user.upsert({
    where: { email: 'lab.tech@qlmts.com' },
    update: {},
    create: {
      email: 'lab.tech@qlmts.com',
      password: labTechPassword,
      name: 'Lab Technician',
      role: 'LAB_TECH',
    },
  });

  console.log('✅ Users created');

  // Create suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { code: 'SUP001' },
    update: {},
    create: {
      code: 'SUP001',
      name: 'Steel Works International',
      contactPerson: 'John Smith',
      email: 'john.smith@steelworks.com',
      phone: '+1-555-0123',
      address: '123 Industrial Ave, Steel City, SC 12345',
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { code: 'SUP002' },
    update: {},
    create: {
      code: 'SUP002',
      name: 'Premium Metals Ltd',
      contactPerson: 'Sarah Johnson',
      email: 'sarah.johnson@premiummetals.com',
      phone: '+1-555-0456',
      address: '456 Metal Drive, Alloy Town, AT 67890',
    },
  });

  console.log('✅ Suppliers created');

  // Create sample heat records
  const heat1 = await prisma.heat.create({
    data: {
      heatNo: 'HT-2024-001234',
      supplierId: supplier1.id,
      materialGrade: 'ASTM A105',
      receivedOn: new Date('2024-01-15'),
      quantity: 2500.0,
      unit: 'KG',
      grnNumber: 'GRN-2024-5678',
      mtcNumber: 'MTC-2024-001',
    },
  });

  const heat2 = await prisma.heat.create({
    data: {
      heatNo: 'HT-2024-001235',
      supplierId: supplier2.id,
      materialGrade: 'ASTM A36',
      receivedOn: new Date('2024-01-20'),
      quantity: 1800.0,
      unit: 'KG',
      grnNumber: 'GRN-2024-5679',
      mtcNumber: 'MTC-2024-002',
    },
  });

  console.log('✅ Heat records created');

  // Create sample records
  const sample1 = await prisma.sample.create({
    data: {
      code: 'S-2024-000001',
      sourceType: 'HEAT',
      heatId: heat1.id,
      priority: 'NORMAL',
      requestedBy: 'production@qlmts.com',
      notes: 'Standard quality verification for production release',
      state: 'REGISTERED',
      registeredAt: new Date(),
    },
  });

  console.log('✅ Sample records created');

  // Create tests for the sample
  const chemicalTest = await prisma.test.create({
    data: {
      sampleId: sample1.id,
      category: 'CHEMICAL',
      method: 'SPECTRO',
      standard: 'ASTM E415',
      status: 'COMPLETED',
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });

  const mechanicalTest = await prisma.test.create({
    data: {
      sampleId: sample1.id,
      category: 'MECHANICAL',
      method: 'TENSILE',
      standard: 'ASTM E8',
      status: 'COMPLETED',
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });

  console.log('✅ Test records created');

  // Create test results
  await prisma.testResult.createMany({
    data: [
      // Chemical results
      {
        testId: chemicalTest.id,
        parameter: 'C',
        value: 0.19,
        unit: '%',
        verdict: 'PASS',
      },
      {
        testId: chemicalTest.id,
        parameter: 'Mn',
        value: 1.15,
        unit: '%',
        verdict: 'PASS',
      },
      {
        testId: chemicalTest.id,
        parameter: 'Si',
        value: 0.35,
        unit: '%',
        verdict: 'PASS',
      },
      // Mechanical results
      {
        testId: mechanicalTest.id,
        parameter: 'UTS',
        value: 520,
        unit: 'MPa',
        verdict: 'PASS',
      },
      {
        testId: mechanicalTest.id,
        parameter: 'YS',
        value: 275,
        unit: 'MPa',
        verdict: 'PASS',
      },
      {
        testId: mechanicalTest.id,
        parameter: 'El',
        value: 25,
        unit: '%',
        verdict: 'PASS',
      },
    ],
  });

  console.log('✅ Test results created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('👥 Default users created:');
  console.log('   Admin: admin@qlmts.com / Admin@123');
  console.log('   QC Manager: qc.manager@qlmts.com / QCManager@123');
  console.log('   Lab Tech: lab.tech@qlmts.com / LabTech@123');
  console.log('');
  console.log('📊 Sample data includes:');
  console.log('   - 2 Suppliers');
  console.log('   - 2 Heat records');
  console.log('   - 1 Sample with completed tests');
  console.log('   - 6 Test results (chemical + mechanical)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });