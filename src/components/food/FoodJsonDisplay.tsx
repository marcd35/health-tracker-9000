import React from 'react';

interface FoodJsonDisplayProps {
  data: any;
}

export function FoodJsonDisplay({ data }: FoodJsonDisplayProps) {
  if (!data) return null;

  return (
    <div className="mt-4 rounded-md bg-slate-950 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-100">Raw JSON Response</h3>
        <span className="text-xs text-slate-400">USDA API v1</span>
      </div>
      <div className="max-h-[300px] overflow-auto rounded border border-slate-800 bg-slate-900 p-2">
        <pre className="text-xs text-slate-50 font-mono whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
