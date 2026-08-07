import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

interface ResumeData {
  title: string;
  subtitle: string;
  summary: string;
  skillsHeader: string;
  skills: string[];
  accomplishments: string[];
}

const resumes: Record<string, ResumeData> = {
  'resume_ai.pdf': {
    title: 'Uday Singh Kushwah',
    subtitle: 'AI & LLM Systems Engineer | Domain: Artificial Intelligence & Agentic Workflows',
    summary: 'AI Engineer specializing in Agentic AI architectures, LLM orchestration, Multi-Agent Systems, RAG pipelines, and Vector Databases using Python, TypeScript, LangGraph, and OpenAI / Gemini APIs.',
    skillsHeader: 'Core Technical Skills',
    skills: [
      'Agentic AI Frameworks: LangGraph, OpenAI Agents SDK, CrewAI, AutoGen',
      'LLMs & Embedding: GPT-4o, Gemini 1.5/2.0, Anthropic Claude, Llama 3',
      'Vector Search & Storage: Qdrant, Pinecone, ChromaDB, PGVector',
      'AI Infrastructure: Python, FastMCP, Docker, Langfuse, OpenTelemetry'
    ],
    accomplishments: [
      'Built autonomous multi-agent pipelines for automated workflow processing.',
      'Optimized RAG retrieval precision by 35% with hybrid search and reranking.',
      'Deployed production agent frameworks with evaluation and memory persistence.'
    ]
  },
  'resume_backend.pdf': {
    title: 'Uday Singh Kushwah',
    subtitle: 'Senior Backend Engineer | Domain: Backend & Distributed Systems',
    summary: 'Senior Backend Engineer with 7+ years of experience designing high-throughput microservices, API gateways, event-driven architectures, and database optimizations using Node.js, TypeScript, PostgreSQL, and MongoDB.',
    skillsHeader: 'Core Technical Skills',
    skills: [
      'Languages & Runtimes: Node.js, TypeScript, Go, JavaScript (ESNext)',
      'Backend Frameworks: NestJS, Express.js, Fastify, GraphQL, REST APIs',
      'Databases & Caching: PostgreSQL, MongoDB, Redis, Elasticsearch',
      'Messaging & Queues: Kafka, RabbitMQ, BullMQ',
      'DevOps & Cloud: Docker, Kubernetes, AWS (ECS, Lambda, S3), CI/CD'
    ],
    accomplishments: [
      'Engineered scalable microservice infrastructure processing 10M+ daily events.',
      'Reduced API latency by 45% through query optimization & Redis caching strategies.',
      'Implemented robust OAuth2/JWT security and RBAC across multi-tenant applications.'
    ]
  },
  'resume_healthcare.pdf': {
    title: 'Uday Singh Kushwah',
    subtitle: 'Healthcare Systems Software Engineer | Domain: HealthTech & Clinical Data Systems',
    summary: 'Senior Software Engineer with deep expertise in HIPAA-compliant healthcare applications, HL7/FHIR integration, clinical decision support tools, and secure medical data pipelines.',
    skillsHeader: 'Core Technical Skills',
    skills: [
      'Standards & Protocols: HL7 v2/v3, FHIR (Fast Healthcare Interoperability Resources), DICOM',
      'Compliance & Security: HIPAA, HITECH, SOC2, Zero-Trust Encryption',
      'Tech Stack: Node.js, TypeScript, Python, PostgreSQL, AWS HealthLake',
      'Integrations: Epic, Cerner EHR API integration'
    ],
    accomplishments: [
      'Implemented secure FHIR API integration connecting hospital EHRs to patient care apps.',
      'Architected HIPAA-compliant end-to-end encrypted medical data pipelines.'
    ]
  },
  'resume_leadership.pdf': {
    title: 'Uday Singh Kushwah',
    subtitle: 'Technical Lead / Engineering Manager | Domain: Engineering Leadership & Architecture',
    summary: 'Technical Lead & Engineering Manager with 8+ years leading cross-functional engineering teams, driving tech strategy, mentoring engineers, and delivering scalable enterprise platforms.',
    skillsHeader: 'Leadership Capabilities',
    skills: [
      'Engineering Management: Team Leadership, Agile/Scrum, Mentorship, hiring & growth',
      'Architecture: Domain-Driven Design (DDD), System Architecture, Tech Roadmap',
      'Process & Quality: CI/CD automation, code review standards, incident management'
    ],
    accomplishments: [
      'Managed team of 10+ software engineers across backend, frontend, and AI domains.',
      'Delivered major enterprise modernization project on time and within budget.'
    ]
  }
};

function generatePdf(fileName: string, data: ResumeData) {
  const outputDir = path.join(__dirname, '../storage/resumes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, fileName);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const writeStream = fs.createWriteStream(filePath);

  doc.pipe(writeStream);

  // Header Section
  doc.fillColor('#1E293B').fontSize(22).font('Helvetica-Bold').text(data.title, { align: 'left' });
  doc.moveDown(0.2);
  doc.fillColor('#2563EB').fontSize(11).font('Helvetica').text(data.subtitle);
  doc.moveDown(0.2);
  doc.fillColor('#64748B').fontSize(9).text(`Email: ${process.env.CANDIDATE_EMAIL || 'candidate@example.com'} | Location: Remote`);
  
  doc.moveDown(0.8);
  doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.8);

  // Summary Section
  doc.fillColor('#0F172A').fontSize(13).font('Helvetica-Bold').text('Professional Summary');
  doc.moveDown(0.3);
  doc.fillColor('#334155').fontSize(10).font('Helvetica').text(data.summary, { lineGap: 3 });

  doc.moveDown(1.0);

  // Skills Section
  doc.fillColor('#0F172A').fontSize(13).font('Helvetica-Bold').text(data.skillsHeader);
  doc.moveDown(0.4);
  data.skills.forEach(skill => {
    doc.fillColor('#2563EB').fontSize(10).font('Helvetica-Bold').text('• ', { continued: true });
    doc.fillColor('#334155').font('Helvetica').text(skill, { lineGap: 2 });
  });

  doc.moveDown(1.0);

  // Accomplishments Section
  doc.fillColor('#0F172A').fontSize(13).font('Helvetica-Bold').text('Key Accomplishments');
  doc.moveDown(0.4);
  data.accomplishments.forEach(acc => {
    doc.fillColor('#10B981').fontSize(10).font('Helvetica-Bold').text('✓ ', { continued: true });
    doc.fillColor('#334155').font('Helvetica').text(acc, { lineGap: 2 });
  });

  doc.end();
  console.log(`Generated PDF resume: ${filePath}`);
}

console.log('Building PDF Resumes...');
Object.entries(resumes).forEach(([fileName, data]) => {
  generatePdf(fileName, data);
});
console.log('PDF Resumes created successfully!');
