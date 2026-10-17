import React from 'react';
import { pushRoute } from './navigation';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
  /** Next.js parity: `scroll={false}` keeps the viewport where it is (filters, pagination). */
  scroll?: boolean;
}

export default function Link({ href, children, onClick, scroll = true, ...props }: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (
      !e.defaultPrevented &&
      e.button === 0 &&
      !props.target &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.shiftKey &&
      href.startsWith('/')
    ) {
      e.preventDefault();
      if (window.location.pathname !== href) {
        // No scrollTo here: the app-level popstate handler owns route-change
        // scroll (instant top on push, restore on Back/Forward). A smooth
        // animated jump-to-top on every link was the primary bug.
        pushRoute(href, { scroll });
      }
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
