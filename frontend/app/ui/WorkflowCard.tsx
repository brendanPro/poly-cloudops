'use client';

import Link from 'next/link';
import {Workflow} from '@/types/workflow';

interface WorkflowCardProps {
  workflow: Workflow;
}

export default function WorkflowCard({workflow}: WorkflowCardProps) {
  // Determine if workflow is active or has restrictions
  const isActive = workflow.status === 'active';
  const isBeta = workflow.status === 'beta';
  const isMaintenance = workflow.status === 'maintenance';

  // Dynamic style based on workflow color
  const cardStyle = {
    background: `linear-gradient(135deg, ${workflow.color.primary}20 0%, ${workflow.color.secondary}20 100%)`,
    borderColor: `${workflow.color.primary}40`,
  } as React.CSSProperties;

  const buttonStyle = {
    background: `linear-gradient(135deg, ${workflow.color.primary} 0%, ${workflow.color.secondary} 100%)`,
  } as React.CSSProperties;

  return (
    <div 
      className="relative rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-glow animate-fade-in group"
      style={cardStyle}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span className={`
          px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
          ${isActive ? 'bg-green-500/20 text-green-300 border border-green-500/30' : ''}
          ${isBeta ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30' : ''}
          ${isMaintenance ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' : ''}
        `}>
          {workflow.status}
        </span>
      </div>

      {/* Workflow Content */}
      <div className="h-full flex flex-col">
        {/* Icon/Visual */}
        <div className="mb-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
            style={{background: `linear-gradient(135deg, ${workflow.color.primary} 0%, ${workflow.color.secondary} 100%)`}}
          >
            {workflow.icon}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
          {workflow.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-grow leading-relaxed">
          {workflow.description}
        </p>

        {/* Launch Button */}
        <Link
          href={workflow.path}
          className={`
            w-full py-3 px-6 rounded-xl text-white font-semibold text-center
            transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95
            ${isActive ? 'opacity-100' : 'opacity-75'}
            ${isMaintenance ? 'cursor-not-allowed grayscale' : ''}
          `}
          style={buttonStyle}
          onClick={(e) => isMaintenance && e.preventDefault()}
        >
          {isMaintenance ? 'Unavailable' : 'Launch Workflow →'}
        </Link>
      </div>
    </div>
  );
}
