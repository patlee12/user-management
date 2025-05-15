import React from 'react';

export default function Footer() {
  return (
    <footer className="glow-box sticky bottom-0 w-full border-t border-border bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} User Management. All rights reserved.
      </div>
    </footer>
  );
}
