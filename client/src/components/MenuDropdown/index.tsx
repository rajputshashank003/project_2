import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({
  isOpen,
  onClose,
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; right?: number; left?: number }>({ top: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (align === 'right') {
        setCoords({
          top: rect.bottom + window.scrollY + 6,
          right: window.innerWidth - rect.right - window.scrollX,
        });
      } else {
        setCoords({
          top: rect.bottom + window.scrollY + 6,
          left: rect.left + window.scrollX,
        });
      }
    }
  }, [isOpen, align]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <React.Fragment>
      {/* Trigger element wrapper */}
      <div className="inline-block" ref={triggerRef}>
        {trigger}
      </div>

      {/* Body Portal for 100% viewport coverage outside parent stacking contexts */}
      {isOpen &&
        createPortal(
          <React.Fragment>
            {/* Full-screen backdrop overlay disabling complete page screen */}
            <div
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs transition-opacity cursor-default animate-fade-in"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Floating dropdown content positioned relative to trigger */}
            <div
              style={{
                position: 'absolute',
                top: coords.top,
                ...(coords.right !== undefined ? { right: coords.right } : { left: coords.left }),
              }}
              className={`z-50 bg-white border border-slate-200 rounded-xl shadow-card-lg py-1.5 animate-fade-in ${className}`}
            >
              {children}
            </div>
          </React.Fragment>,
          document.body
        )}
    </React.Fragment>
  );
};

export default MenuDropdown;
