'use client';

import Link from 'next/link';
import { Workflow } from '@/types/workflow';
import WorkflowIcon from '@/app/ui/WorkflowIcon';

interface WorkflowCardProps {
  workflow: Workflow;
}

const categoryLabel: Record<Workflow['category'], string> = {
  text: 'Text',
  image: 'Image',
  data: 'Data',
  automation: 'Automation',
};

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  const isMaintenance = workflow.status === 'maintenance';

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Color bar top */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${workflow.gradient[0]}, ${workflow.gradient[1]})` }}
      />

      <div className="flex flex-col flex-1 p-6">
        {/* Icon + category row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${workflow.gradient[0]}, ${workflow.gradient[1]})`,
              color: '#fff',
            }}
          >
            <WorkflowIcon iconKey={workflow.iconKey} className="w-5 h-5" />
          </div>

          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{
              background: 'var(--border-subtle)',
              color: 'var(--foreground-muted)',
              border: '1px solid var(--border)',
            }}
          >
            {categoryLabel[workflow.category]}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-base font-semibold mb-2 leading-snug"
          style={{ color: 'var(--foreground)' }}
        >
          {workflow.name}
        </h3>

        {/* Description */}
        <p
          className="text-sm leading-relaxed flex-grow mb-6"
          style={{ color: 'var(--foreground-muted)' }}
        >
          {workflow.description}
        </p>

        {/* CTA */}
        {isMaintenance ? (
          <span
            className="text-sm font-medium text-center py-2.5 px-4 rounded-lg"
            style={{ background: 'var(--border-subtle)', color: 'var(--foreground-subtle)' }}
          >
            Unavailable
          </span>
        ) : (
          <Link
            href={workflow.path}
            className="group/link flex items-center justify-between py-2.5 px-4 rounded-lg text-sm font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-98"
            style={{
              background: `linear-gradient(135deg, ${workflow.gradient[0]}, ${workflow.gradient[1]})`,
            }}
          >
            <span>Open workflow</span>
            <svg className="w-4 h-4 transition-transform duration-150 group-hover/link:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
