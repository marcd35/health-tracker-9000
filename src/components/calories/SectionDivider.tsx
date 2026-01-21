interface SectionDividerProps {
  title: string;
  icon?: React.ReactNode;
}

export function SectionDivider({ title, icon }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-3 my-8">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <h2 className="text-2xl font-bold text-foreground whitespace-nowrap">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent ml-4" />
    </div>
  );
}
