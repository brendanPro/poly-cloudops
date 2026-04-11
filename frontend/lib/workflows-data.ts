import { Workflow } from '@/types/workflow';

export const workflows: Workflow[] = [
  {
    id: 'translate',
    name: 'Text Translation',
    description: 'Translate text across multiple languages via the DeepL API, routed through an n8n webhook.',
    category: 'text',
    status: 'active',
    color: {
      primary: '#1d4ed8',
      secondary: '#4f46e5',
      accent: '#818cf8',
    },
    gradient: ['#1d4ed8', '#4f46e5'],
    path: '/translate',
    iconKey: 'translate',
  },
  {
    id: 'qr',
    name: 'QR Code Generator',
    description: 'Encode any text or URL into a QR code image, generated on-demand through n8n.',
    category: 'automation',
    status: 'active',
    color: {
      primary: '#0f172a',
      secondary: '#1e1b4b',
      accent: '#6366f1',
    },
    gradient: ['#0f172a', '#1e1b4b'],
    path: '/qr',
    iconKey: 'qr',
  },
  {
    id: 'json-to-excel',
    name: 'JSON to Excel',
    description: 'Convert a JSON array of objects into a downloadable Excel spreadsheet via n8n.',
    category: 'data',
    status: 'active',
    color: {
      primary: '#065f46',
      secondary: '#0d9488',
      accent: '#34d399',
    },
    gradient: ['#065f46', '#0d9488'],
    path: '/json-to-excel',
    iconKey: 'spreadsheet',
  },
  {
    id: 'summarize',
    name: 'AI Text Summarizer',
    description: 'Summarize long-form text using an AI language model via OpenRouter and n8n.',
    category: 'text',
    status: 'active',
    color: {
      primary: '#4338ca',
      secondary: '#7c3aed',
      accent: '#a78bfa',
    },
    gradient: ['#4338ca', '#7c3aed'],
    path: '/summarize',
    iconKey: 'ai',
  },
  {
    id: 'weather',
    name: 'Weather Forecast',
    description: 'Fetch real-time weather data for any city using Open-Meteo, routed through n8n.',
    category: 'automation',
    status: 'active',
    color: {
      primary: '#0369a1',
      secondary: '#0284c7',
      accent: '#38bdf8',
    },
    gradient: ['#0369a1', '#0284c7'],
    path: '/weather',
    iconKey: 'weather',
  },
  {
    id: 'currency',
    name: 'Currency Converter',
    description: 'Convert between world currencies using live exchange rates via n8n and ExchangeRate-API.',
    category: 'data',
    status: 'active',
    color: {
      primary: '#065f46',
      secondary: '#059669',
      accent: '#6ee7b7',
    },
    gradient: ['#065f46', '#059669'],
    path: '/currency',
    iconKey: 'currency',
  },
];

export const getWorkflowById = (id: string): Workflow | undefined =>
  workflows.find((w) => w.id === id);

export const getWorkflowsByCategory = (category: Workflow['category']): Workflow[] =>
  workflows.filter((w) => w.category === category);

export const getActiveWorkflows = (): Workflow[] =>
  workflows.filter((w) => w.status === 'active');
