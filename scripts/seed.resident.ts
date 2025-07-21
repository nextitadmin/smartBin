import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Resident } from '../src/models/users/resident.model';
import { Wallet } from '../src/models/wallet.model';
import { Bill } from '../src/models/bill.model'
import { SmartBin } from '../src/models/smartbin.model';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const residentModel = app.get<Model<Resident>>(getModelToken('Resident'));
  const walletModel = app.get<Model<Wallet>>(getModelToken('Wallet'));
  const billModel = app.get<Model<Bill>>(getModelToken('Bill'));
  const smartBinModel = app.get<Model<SmartBin>>(getModelToken('SmartBin'));

  console.log('🌱 Seeding test resident...');

  // Remove existing test resident with same email
  await residentModel.deleteOne({ email: 'bukola@example.com' });

  // 1. Create test resident
  const testResident = await residentModel.create({
    firstName: 'Bukola',
    lastName: 'Amoo',
    email: 'bukola@example.com',
    phoneNumber: '08012345678',
    password: '123456', // Schema should hash this
    role: 'Resident',
    payerId: 'RES1234587', // You can generate dynamically if needed
  });

  // 2. Create wallet
  await walletModel.create({
    userId: testResident._id,
    balance: 5000,
  });

  // 3. Create bills
  await billModel.create([
    {
      userId: testResident._id,
      billId: 'RES1234587',
       service:"Waste Disposal",
      userType: 'Resident',
      status: 'pending',
      amount: 2500,
      description: 'Waste bill for July',
      dueDate: new Date(),
    },
    {
      userId: testResident._id,
       service:"Waste Disposal",
      billId: 'RES1234589',
      userType: 'Resident',
      status: 'completed',
      amount: 2500,
      description: 'Waste bill for June',
      dueDate: new Date(),
    },
  ]);

  // 4. Create smartbin application
  await smartBinModel.create({
    userId: testResident._id,
     payerId: 'RES1234587', 

    userType: 'Resident',
    status: 'approved',
    applicationDate: new Date(),
  });

  console.log('✅ Test resident seeded successfully.');
  await app.close();
}


// Run the seeding
bootstrap().catch((err) => {
  console.error('❌ Seeding failed:', err);
});
