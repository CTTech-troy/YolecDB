import { SITE_LOGO_SRC, SITE_NAME } from '@/constants/brand';

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
} as const;

interface BrandLogoProps {
  size?: keyof typeof sizeClasses;
  className?: string;
  imageClassName?: string;
  showName?: boolean;
  nameClassName?: string;
}

export function BrandLogo({
  size = 'md',
  className = '',
  imageClassName = '',
  showName = false,
  nameClassName = '',
}: BrandLogoProps) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <img
        src={SITE_LOGO_SRC}
        alt={SITE_NAME}
        className={`${sizeClasses[size]} shrink-0 object-contain ${imageClassName}`}
      />
      {showName && (
        <div className="min-w-0">
          <span
            className={`block truncate font-semibold text-slate-900 dark:text-white ${nameClassName}`}
          >
            {SITE_NAME}
          </span>
        </div>
      )}
    </div>
  );
}
