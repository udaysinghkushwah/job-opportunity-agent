import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { workflowEngine } from '../../workflows/opportunity.graph';
import { dbService } from '../../database/mongodb.service';
import { ResumeTool } from '../../tools/resume.tool';
import { GmailTool } from '../../tools/gmail.tool';
import { inboxWatcher } from '../../services/inbox-watcher.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;
const resumeTool = new ResumeTool();
const gmailTool = new GmailTool();

app.use(cors());
app.use(express.json());

// Serve Static Web Dashboard (Angular App)
const distPath = path.join(__dirname, '../web/dist');
const srcPath = path.join(__dirname, '../web/src');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  app.use(express.static(srcPath));
}

// SPA Routing Fallback
app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) return next();
  const distIndex = path.join(distPath, 'index.html');
  if (require('fs').existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  return res.sendFile(path.join(srcPath, 'index.html'));
});

// Server-Sent Events (SSE) Clients
const sseClients: Response[] = [];

workflowEngine.on('step_complete', (event) => {
  broadcastSSE('step_complete', event);
});

workflowEngine.on('step_start', (event) => {
  broadcastSSE('step_start', event);
});

workflowEngine.on('step_error', (event) => {
  broadcastSSE('step_error', event);
});

function broadcastSSE(type: string, data: any) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => client.write(payload));
}

// SSE Endpoint
app.get('/api/events/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);
  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Inbox Watcher Endpoints
app.post('/api/inbox/watcher/start', (req: Request, res: Response) => {
  const interval = req.body.intervalMs ? parseInt(req.body.intervalMs) : 15000;
  inboxWatcher.startWatching(interval);
  return res.json({ success: true, status: inboxWatcher.getStatus() });
});

app.post('/api/inbox/watcher/stop', (req: Request, res: Response) => {
  inboxWatcher.stopWatching();
  return res.json({ success: true, status: inboxWatcher.getStatus() });
});

app.get('/api/inbox/watcher/status', (req: Request, res: Response) => {
  return res.json({ status: inboxWatcher.getStatus() });
});

// Fetch Gmail Inbox and Process Through Pipeline Automatically
app.post('/api/emails/fetch-inbox', async (req: Request, res: Response) => {
  const limit = req.body.limit ? parseInt(req.body.limit) : 3;
  const unreadOnly = req.body.unreadOnly === true;

  console.log(`[API] Triggered Manual Gmail Inbox Read for user: ${process.env.GMAIL_USER}...`);
  const fetched = await gmailTool.fetchInboxEmails(limit, unreadOnly);

  if (!fetched || fetched.length === 0) {
    return res.json({ success: true, count: 0, message: 'No messages fetched from Gmail inbox.', results: [] });
  }

  const results = [];
  for (const email of fetched) {
    console.log(`[API] Auto-processing fetched email: "${email.subject}" from "${email.from}"`);
    const finalState = await workflowEngine.processEmail(email);
    results.push(finalState);
  }

  return res.json({ success: true, count: results.length, opportunitiesProcessed: results });
});

// Simulate Email Ingestion Endpoint
app.post('/api/emails/simulate', async (req: Request, res: Response) => {
  const { from, subject, body } = req.body;

  if (!from || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: from, subject, body' });
  }

  const rawEmail = {
    messageId: `sim_msg_${Date.now()}`,
    threadId: `sim_th_${Date.now()}`,
    from,
    subject,
    body,
    receivedAt: new Date().toISOString()
  };

  const finalState = await workflowEngine.processEmail(rawEmail);
  return res.json({ success: true, opportunityId: finalState.opportunityId, state: finalState });
});

// List All Opportunities
app.get('/api/opportunities', async (req: Request, res: Response) => {
  const items = await dbService.getAllOpportunities();
  return res.json(items || []);
});

// Get Single Opportunity
app.get('/api/opportunities/:id', async (req: Request, res: Response) => {
  const item = await dbService.getOpportunity(req.params.id);
  if (!item) return res.status(404).json({ error: 'Opportunity not found' });
  return res.json(item);
});

// List Resumes
app.get('/api/resumes', (req: Request, res: Response) => {
  const resumes = resumeTool.getAvailableResumes();
  return res.json({ resumes });
});

// System Status
app.get('/api/health', (req: Request, res: Response) => {
  return res.json({
    status: 'OK',
    agentEngine: 'Active',
    watcher: inboxWatcher.getStatus(),
    provider: process.env.LLM_PROVIDER || 'mock'
  });
});

async function startServer() {
  await dbService.connect();
  app.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 AI Job Opportunity Agent Dashboard running at: http://localhost:${PORT}`);
    console.log(`=============================================================\n`);

    // Activate automatic background inbox watcher
    inboxWatcher.startWatching(15000);
  });
}

startServer();
