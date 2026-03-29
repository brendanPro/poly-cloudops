import {Workflow} from '@/types/workflow';

export const workflows: Workflow[] = [
  {
    id: 'translate',
    name: 'Text Translation',
    description: 'Translate text by triggering the n8n translation workflow through its webhook',
    category: 'text',
    status: 'active',
    color: {
      primary: '#0D47A1',
      secondary: '#6A1B9A',
      accent: '#FF6F00'
    },
    gradient: ['#0D47A1', '#6A1B9A'] as [string, string],
    path: '/translate',
    icon: '🌐'
  }
  // Future workflows can be added here
];

export const getWorkflowById = (id: string): Workflow | undefined => {
  return workflows.find(w => w.id === id);
};

export const getWorkflowsByCategory = (category: Workflow['category']): Workflow[] => {
  return workflows.filter(w => w.category === category);
};

export const getActiveWorkflows = (): Workflow[] => {
  return workflows.filter(w => w.status === 'active');
};

export const getStats = () => {
  const activeCount = workflows.filter(w => w.status === 'active').length;
  const betaCount = workflows.filter(w => w.status === 'beta').length;
  
  return {
    total: workflows.length,
    active: activeCount,
    beta: betaCount,
    // Mock runs count - would come from API in real implementation
    totalRuns: 127
  };
};
