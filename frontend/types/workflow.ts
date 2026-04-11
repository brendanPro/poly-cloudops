export type WorkflowStatus = 'active' | 'beta' | 'maintenance';
export type WorkflowCategory = 'text' | 'image' | 'data' | 'automation';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  status: WorkflowStatus;
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
  gradient: [string, string];
  path: string;
  iconKey: 'translate' | 'qr' | 'spreadsheet' | 'ai' | 'weather' | 'currency';
}
