import { Client } from '@/types/database';
import { MvpCanvas } from '@/types/mvp';
import { ConversationMessage } from '@/types/database';

interface HandoffPromptData {
  client: Client;
  mvp: MvpCanvas;
  messages: ConversationMessage[];
}

export function getHandoffGenerationPrompt(data: HandoffPromptData): string {
  const { client, mvp, messages } = data;

  const recentMessages = messages.slice(-20).map(m => `[${m.sender_role}]: ${m.content}`).join('\n');

  return `You are an expert technical writer creating a comprehensive handoff document for a software project delivery.

Client Context:
- Company: ${client.company_name}
- Sector: ${client.sector}
- Problem: ${client.problem_description}
- Budget: ${client.budget_range}
- Timeline: ${client.timeline}

MVP Canvas:
${JSON.stringify(mvp, null, 2)}

Recent Discussion:
${recentMessages || 'No discussion messages'}

Generate a comprehensive handoff document in Markdown format with these sections (in order):

## Context
- Brief overview of the project and client objectives
- Problem statement and goals
- Key stakeholders

## Solution
- High-level overview of the MVP solution
- Key features and capabilities
- User flows and interactions
- Technical approach and architecture

## Decisions
- Key architectural decisions with rationale
- Technology choices and alternatives considered
- Design patterns and conventions used

## Specifications
- Component breakdown and descriptions
- API endpoints and integrations
- Data schemas
- Third-party service requirements

## Budget
- Development costs breakdown
- Infrastructure and deployment costs
- Monthly maintenance estimate
- Total investment summary

## Feature Requests
- Prioritized list of future enhancements
- Implementation notes and considerations

## Next Steps
- Phase-by-phase rollout plan
- Timeline and milestones
- Success metrics and KPIs
- Support and maintenance plan

Write in professional, clear language. Use markdown formatting with proper headers, lists, and code blocks where appropriate. Be specific and actionable.`;
}
