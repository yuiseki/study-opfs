import React, { useEffect, useRef } from 'react';

interface ContextMenuItem {
  label: string;
  onClick: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      style={{
        left: position.x,
        top: position.y,
        minWidth: '160px',
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}