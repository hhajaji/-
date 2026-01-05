
export enum Sender {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
}

export interface N8NWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServerStats {
  cpu: number;
  memory: number;
  uptime: string;
  activeWorkflows: number;
}

// Fix: Added N8NResponse interface to define the expected structure of n8n webhook responses
export interface N8NResponse {
  output?: string;
  message?: string;
  response?: string;
  text?: string;
  reply?: string;
  [key: string]: any;
}
