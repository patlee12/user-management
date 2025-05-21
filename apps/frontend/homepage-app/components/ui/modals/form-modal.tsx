'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/buttons/button';

export interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'url' | 'textarea';
}

interface FormModalProps {
  className?: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, string | null>) => void;
  fields: FieldConfig[];
  initialValues?: Record<string, string>;
}

export default function FormModal({
  className,
  title,
  isOpen,
  onClose,
  onSubmit,
  fields,
  initialValues = {},
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    fields.forEach((field) => {
      initial[field.key] = initialValues[field.key] ?? '';
    });
    setFormData(initial);
  }, [fields, initialValues]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const cleaned = Object.fromEntries(
      Object.entries(formData).map(([key, val]) => [
        key,
        val.trim() === '' ? null : val,
      ]),
    );
    onSubmit(cleaned);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div
        className={`${className} fixed inset-0 flex items-center justify-center p-4`}
      >
        <DialogPanel className="bg-background text-foreground max-w-md w-full rounded-xl p-6 space-y-6 shadow-xl">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>

          <div className="space-y-4">
            {fields.map(({ key, label, type = 'text' }: FieldConfig) => (
              <div key={key}>
                <label className="block mb-1 text-sm font-medium">
                  {label}
                </label>
                {type === 'textarea' ? (
                  <textarea
                    value={formData[key] ?? ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full border border-muted bg-background text-foreground p-2 rounded-md resize-none"
                  />
                ) : (
                  <input
                    type={type}
                    value={formData[key] ?? ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full border border-muted bg-background text-foreground p-2 rounded-md"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
