/**
 * lucide-react no longer ships brand/logo icons, so these small inline SVGs
 * fill in for the handful of social platforms we link to. Sized and colored
 * the same way as lucide icons (currentColor fill, className passthrough).
 */

interface IconProps {
  className?: string;
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-8.1h2.7l.4-3.2h-3.1V7.7c0-.9.25-1.5 1.6-1.5H16.7V3.4C16.4 3.35 15.4 3.25 14.3 3.25c-2.35 0-3.95 1.4-3.95 4V9.7H7.6v3.2h2.75V21h3.15Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.6 7.6a2.9 2.9 0 0 0-2-2C17.9 5 12 5 12 5s-5.9 0-7.6.6a2.9 2.9 0 0 0-2 2A30 30 0 0 0 2 12a30 30 0 0 0 .4 4.4 2.9 2.9 0 0 0 2 2C6.1 19 12 19 12 19s5.9 0 7.6-.6a2.9 2.9 0 0 0 2-2A30 30 0 0 0 22 12a30 30 0 0 0-.4-4.4ZM10 15.3V8.7l5.5 3.3-5.5 3.3Z" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.94 8.5H3.56V20.5H6.94V8.5ZM5.25 3.5A2 2 0 1 0 5.25 7.5 2 2 0 0 0 5.25 3.5ZM20.5 13.7C20.5 10.4 18.6 8.7 16 8.7c-1.5 0-2.6.65-3.2 1.6V8.5H9.4C9.45 9.4 9.4 20.5 9.4 20.5h3.4v-6.7c0-.35 0-.7.1-1 .3-.7.9-1.4 2-1.4 1.4 0 2 1.05 2 2.6v6.5h3.4v-6.8Z" />
    </svg>
  );
}
