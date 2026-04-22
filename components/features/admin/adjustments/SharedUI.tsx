import { ReactNode } from 'react';
import { LucideIcon, Loader2, Save } from 'lucide-react';

export function FormField({ 
  label, 
  id, 
  icon: Icon, 
  children, 
  description,
  className = ""
}: { 
  label: string; 
  id: string; 
  icon?: LucideIcon; 
  children: ReactNode; 
  description?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="text-[10px] font-black uppercase opacity-50 px-1 flex items-center gap-1">
        {Icon && <Icon size={10} />} {label}
      </label>
      {children}
      {description && <p className="text-[9px] text-muted-foreground italic px-1 leading-tight">{description}</p>}
    </div>
  );
}

export function EditorHeader({ 
  title, 
  icon: Icon, 
  onSave, 
  saving, 
  children,
  saveLabel = "Save Changes"
}: { 
  title: string; 
  icon: LucideIcon; 
  onSave: () => void; 
  saving: boolean; 
  children?: ReactNode;
  saveLabel?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <h3 className="font-bold flex items-center gap-2 text-primary">
          <Icon size={18} /> {title}
        </h3>
        {children}
      </div>
      <button 
        onClick={onSave} 
        disabled={saving}
        className="bg-primary text-white px-5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {saveLabel}
      </button>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon, title: string, description?: string, action?: ReactNode }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center gap-3 opacity-20 border-2 border-dashed border-border rounded-2xl">
      <Icon size={40} />
      <p className="text-xs font-black uppercase tracking-widest">{title}</p>
      {description && <p className="text-[10px] font-medium">{description}</p>}
      {action}
    </div>
  );
}
