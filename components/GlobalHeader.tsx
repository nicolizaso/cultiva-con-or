import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";
// Importamos el icono Sprout (Brote)
import { Sprout } from "lucide-react";

interface GlobalHeaderProps {
  title?: string;
  subtitle?: string;
  userEmail?: string;
}

export default function GlobalHeader({ title, subtitle, userEmail }: GlobalHeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6 pt-2">
      <div className="flex flex-col">
        {/* LOGO / NOMBRE APP */}
        <div className="flex items-center gap-2 mb-1">
            {/* Icono Vectorial Institucional */}
            <Sprout className="text-brand-primary w-6 h-6" strokeWidth={2.5} />
            
            <span className="font-title text-brand-text text-lg tracking-wider uppercase">
                Cultivapp
            </span>
        </div>
        
        {title && (
            <h1 className="text-sm font-bold font-body text-brand-muted hidden md:block">
                {title} {subtitle && <span className="font-normal opacity-50">| {subtitle}</span>}
            </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu email={userEmail} />
      </div>
    </header>
  );
}