import { forwardRef } from 'react';
import { Scan } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ size = 'md', showText = true }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-14 h-14',
    };

    const textClasses = {
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
    };

    return (
      <div ref={ref} className="flex items-center gap-3">
        <div className={`${sizeClasses[size]} bg-primary rounded-xl flex items-center justify-center shadow-soft`}>
          <Scan className="text-primary-foreground" size={size === 'lg' ? 28 : size === 'md' ? 22 : 18} />
        </div>
        {showText && (
          <div>
            <h1 className={`${textClasses[size]} font-bold text-foreground leading-tight`}>
              FaceAbsen
            </h1>
            <p className="text-xs text-muted-foreground -mt-0.5">Sistem Absensi Wajah</p>
          </div>
        )}
      </div>
    );
  }
);

Logo.displayName = 'Logo';
