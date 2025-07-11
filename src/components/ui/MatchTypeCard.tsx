
import { cn } from "@/lib/utils";

interface MatchTypeCardProps {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const MatchTypeCard = ({ 
  title, 
  icon, 
  isActive = false, 
  onClick 
}: MatchTypeCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card rounded-lg p-4 text-center cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
        isActive && "border-tacktix-blue bg-tacktix-blue/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
      )}
    >
      <div className="flex flex-col items-center">
        <div className={cn(
          "h-12 w-12 flex items-center justify-center rounded-full mb-3 transition-all",
          isActive 
            ? "bg-tacktix-blue text-white" 
            : "bg-tacktix-dark-light text-gray-300"
        )}>
          {icon}
        </div>
        <h3 className={cn(
          "font-medium",
          isActive ? "text-tacktix-blue" : "text-gray-300"
        )}>
          {title}
        </h3>
      </div>
    </div>
  );
};

export default MatchTypeCard;
