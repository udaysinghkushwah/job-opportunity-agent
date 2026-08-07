import { dbService } from '../database/mongodb.service';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  const connected = await dbService.connect();
  if (connected) {
    console.log('🎉 MongoDB Atlas connection is WORKING!');
    const testDoc = await dbService.saveOpportunity({
      opportunityId: `test_atlas_${Date.now()}`,
      company: 'MongoDB Atlas Test Corp',
      recruiterName: 'Atlas Recruiter',
      role: 'Database Reliability Engineer',
      lastEmailSubject: 'Atlas Connection Test',
      lastEmailBody: 'Testing connection to Atlas MongoDB cluster.',
      status: 'ANALYZED',
      nextAction: 'Atlas Connection Verified'
    });
    console.log('Saved document to Atlas MongoDB:', testDoc.opportunityId);
    
    const all = await dbService.getAllOpportunities();
    console.log(`Retrieved ${all.length} opportunities from MongoDB.`);
  } else {
    console.error('❌ Could not connect to MongoDB Atlas.');
  }
  process.exit(0);
}

testConnection();
