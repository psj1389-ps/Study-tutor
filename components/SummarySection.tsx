
import React from 'react';

interface SummarySectionProps {
  summary: string;
}

const SummarySection: React.FC<SummarySectionProps> = ({ summary }) => {
  return (
    <div className="prose max-w-none prose-slate">
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Core Concepts Summary</h3>
      <p className="text-slate-600 whitespace-pre-wrap">{summary}</p>
    </div>
  );
};

export default SummarySection;
