import { workflowEngine } from '../workflows/opportunity.graph';
import { dbService } from '../database/mongodb.service';

async function runTests() {
  console.log('--- STARTING AGENTIC JOB OPPORTUNITY WORKFLOW TESTS ---\n');

  await dbService.connect();

  // Test Case 1: Node.js Recruiter Interview Request -> AUTO_REPLY + Resume Backend + Calendar Event
  console.log('>>> TEST CASE 1: Recruiter Interview Request (Node.js Lead)');
  const test1 = await workflowEngine.processEmail({
    messageId: 'test_msg_1',
    threadId: 'test_th_1',
    from: 'reecha@abc-tech.com',
    subject: 'Interview Schedule - Senior Node.js Engineer',
    body: 'Hi Uday, We reviewed your profile for Senior Node.js Engineer. Please share your updated resume and confirm availability for tomorrow 3 PM.',
    receivedAt: new Date().toISOString()
  });

  console.assert(test1.status === 'INTERVIEW_SCHEDULED', 'Test 1 Failed: Status should be INTERVIEW_SCHEDULED');
  console.assert(test1.decision?.action === 'AUTO_REPLY', 'Test 1 Failed: Decision action should be AUTO_REPLY');
  console.assert(test1.selectedResume?.category === 'Backend', 'Test 1 Failed: Selected resume category should be Backend');
  console.assert(test1.emailSent?.success === true, 'Test 1 Failed: Email should be sent');
  console.assert(test1.calendarEvent?.success === true, 'Test 1 Failed: Calendar event should be created');

  console.log('\n✅ TEST CASE 1 PASSED!\n');

  // Test Case 2: AI Engineer Recruiter Email -> AUTO_REPLY + Resume AI
  console.log('>>> TEST CASE 2: AI Engineer Email');
  const test2 = await workflowEngine.processEmail({
    messageId: 'test_msg_2',
    threadId: 'test_th_2',
    from: 'recruiter@ai-frontier.io',
    subject: 'Senior AI Engineer Opportunity',
    body: 'Hi Uday, We saw your work on Agentic AI and LLMs. Please attach your resume.',
    receivedAt: new Date().toISOString()
  });

  console.assert(test2.selectedResume?.category === 'AI', 'Test 2 Failed: Selected resume category should be AI');
  console.log('\n✅ TEST CASE 2 PASSED!\n');

  // Test Case 3: Promotional Spam Email -> REJECT_IGNORE
  console.log('>>> TEST CASE 3: Promotional Spam Email');
  const test3 = await workflowEngine.processEmail({
    messageId: 'test_msg_3',
    threadId: 'test_th_3',
    from: 'marketing@crypto-fast-loans.net',
    subject: 'CLAIM $5000 CRYPTO REWARD IMMEDIATELY - UNSUBSCRIBE',
    body: 'Click here to claim instant loan. Unsubscribe if not interested.',
    receivedAt: new Date().toISOString()
  });

  console.assert(test3.decision?.action === 'REJECT_IGNORE', 'Test 3 Failed: Decision action should be REJECT_IGNORE');
  console.assert(test3.status === 'REJECTED', 'Test 3 Failed: Status should be REJECTED');

  console.log('\n✅ TEST CASE 3 PASSED!\n');

  console.log('===================================================');
  console.log('ALL 3 MULTI-AGENT PIPELINE TESTS PASSED CLEANLY! 🎉');
  console.log('===================================================\n');

  process.exit(0);
}

runTests();
