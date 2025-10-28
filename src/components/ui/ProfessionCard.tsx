import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionCardProps {
  icon: LucideIcon;
  title: string;
  isSelected: boolean;
  onClick: () => void;
}
 
const ProfessionCard = ({ icon: Icon, title, isSelected, onClick }: ProfessionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center",
        "p-8 rounded-2xl border-2 transition-all duration-200",
        "hover:shadow-[0_0_30px_rgba(14,165,233,0.3)]",
        isSelected
          ? "bg-primary border-primary shadow-[0_0_30px_rgba(14,165,233,0.4)]"
          : "bg-transparent border-primary/30 hover:bg-primary/10 hover:border-primary/50"
      )}
    >
      <Icon 
        className={cn(
          "w-12 h-12 mb-4 transition-all duration-200",
          isSelected 
            ? "text-primary-foreground" 
            : "text-primary group-hover:scale-110"
        )} 
      />
      <span 
        className={cn(
          "text-lg transition-all duration-200",
          isSelected 
            ? "text-primary-foreground font-bold" 
            : "text-foreground font-semibold"
        )}
      >
        {title}
      </span>
    </button>
  );
};

export default ProfessionCard;
