"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{ className?: string }>;
const iconMap = Icons as unknown as Record<string, IconComponent>;

export const POPULAR_ICONS = [
  "Utensils", "Coffee", "ShoppingBag", "Car", "Home", "Film", "HeartPulse", "Zap",
  "Briefcase", "Gift", "PiggyBank", "Cigarette", "HelpCircle", "Smile", "Flame",
  "Shield", "Tag", "Wallet", "CreditCard", "Landmark", "Smartphone", "Laptop",
  "Plane", "Truck", "Music", "BookOpen", "Sparkles", "Circle", "Receipt", "Shirt",
  "Wrench", "Dumbbell", "Bus", "Bike", "Scissors", "Baby", "Gamepad2"
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = "#e7a33e" }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const SelectedIcon = iconMap[value] || Icons.Circle;

  const filteredIcons = POPULAR_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="w-full inline-flex items-center justify-between h-10 px-3 font-normal rounded-xl border bg-background hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20`, color }}>
            <SelectedIcon className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-foreground">{value || "Select Icon"}</span>
        </div>
        <Icons.ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3 rounded-2xl bg-popover shadow-lg space-y-2" align="start">
        <Input
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs rounded-lg"
        />

        <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {filteredIcons.map((iconName) => {
            const IconComp = iconMap[iconName] || Icons.HelpCircle;
            const isSelected = value === iconName;
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => {
                  onChange(iconName);
                  setIsOpen(false);
                }}
                className={cn(
                  "p-2 rounded-xl flex items-center justify-center transition-all hover:bg-muted focus-visible:outline-none",
                  isSelected ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground"
                )}
                title={iconName}
              >
                <IconComp className="h-4 w-4 shrink-0" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
