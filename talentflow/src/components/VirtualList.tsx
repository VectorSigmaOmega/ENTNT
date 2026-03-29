import React, { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualListProps {
  height: number | string;
  width: number | string;
  itemCount: number;
  itemSize: number;
  children: (props: { index: number; style: React.CSSProperties }) => React.ReactNode;
}

export function VirtualList({ height, width, itemCount, itemSize, children }: VirtualListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const totalHeight = itemCount * itemSize;
  const containerHeight = typeof height === 'number' ? height : 600; // Default fallback

  const startIndex = Math.floor(scrollTop / itemSize);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + containerHeight) / itemSize) + 5 // Overscan
  );

  const items = [];
  for (let i = startIndex; i <= endIndex; i++) {
    items.push(
      children({
        index: i,
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${itemSize}px`,
          transform: `translateY(${i * itemSize}px)`,
        },
      })
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height,
        width,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {items}
      </div>
    </div>
  );
}
