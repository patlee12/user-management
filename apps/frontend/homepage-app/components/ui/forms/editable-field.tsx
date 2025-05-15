'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  label?: string;
  value: string | null | undefined;
  onSave: (newValue: string) => void | Promise<void>;
  placeholder?: string;
  textarea?: boolean;
  className?: string;
}

export default function EditableField({
  label,
  value: initialValue,
  onSave,
  placeholder = 'Click to edit',
  textarea = false,
  className,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue ?? '');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  useEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue]);

  const handleSave = async () => {
    if (value !== initialValue) {
      await onSave(value);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !textarea) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue ?? '');
      setEditing(false);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          {label}
        </label>
      )}

      {editing ? (
        textarea ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )
      ) : (
        <div
          className="cursor-pointer text-foreground hover:text-primary transition"
          onClick={() => setEditing(true)}
        >
          {initialValue ? (
            initialValue
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
}
