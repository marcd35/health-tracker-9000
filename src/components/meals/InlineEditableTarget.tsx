'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

interface InlineEditableTargetProps {
  value: number;
  label: string;
  unit: string;
  onSave: (value: number) => Promise<void>;
  className?: string;
}

export function InlineEditableTarget({
  value,
  label,
  unit,
  onSave,
  className,
}: InlineEditableTargetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const numValue = parseInt(editValue);
    if (isNaN(numValue) || numValue <= 0) {
      setEditValue(value.toString());
      setIsEditing(false);
      return;
    }

    if (numValue !== value) {
      setIsSaving(true);
      try {
        await onSave(numValue);
      } catch {
        setEditValue(value.toString());
      }
      setIsSaving(false);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className={cn('inline-flex items-center gap-1', className)}>
        <span className="text-xs text-muted-foreground">{label}:</span>
        <Input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="w-20 h-6 text-xs px-2"
        />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={cn(
        'inline-flex items-center gap-1 hover:bg-muted/50 rounded px-1.5 py-0.5 transition-colors group',
        className
      )}
      title={`Click to edit ${label.toLowerCase()} target`}
    >
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-xs font-medium">{value}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
