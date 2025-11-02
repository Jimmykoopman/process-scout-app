import React from 'react';
import { useReactFlow, useStoreApi } from 'reactflow';
import { cn } from '@/lib/utils';

// Zes sleepbare bolletjes om de canvas te verplaatsen zonder achtergrond-drag
export const CanvasPanDots: React.FC = () => {
  const { setViewport } = useReactFlow();
  const store = useStoreApi();

  const draggingRef = React.useRef(false);
  const startRef = React.useRef<{ x: number; y: number; vx: number; vy: number; zoom: number }>({ x: 0, y: 0, vx: 0, vy: 0, zoom: 1 });

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { transform } = store.getState();
    const [vx, vy, zoom] = transform;
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY, vx, vy, zoom };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setViewport({ x: startRef.current.vx + dx, y: startRef.current.vy + dy, zoom: startRef.current.zoom });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const Dot: React.FC<{ className?: string; title: string }> = ({ className, title }) => (
    <button
      title={title}
      aria-label={title}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        'pointer-events-auto h-4 w-4 rounded-full bg-primary shadow-md border border-border',
        'hover:scale-110 transition-transform',
        className
      )}
    />
  );

  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none">
      {/* Boven midden */}
      <Dot className="absolute top-3 left-1/2 -translate-x-1/2" title="Canvas verplaatsen" />
      {/* Onder midden */}
      <Dot className="absolute bottom-3 left-1/2 -translate-x-1/2" title="Canvas verplaatsen" />
      {/* Links midden */}
      <Dot className="absolute left-3 top-1/2 -translate-y-1/2" title="Canvas verplaatsen" />
      {/* Rechts midden */}
      <Dot className="absolute right-3 top-1/2 -translate-y-1/2" title="Canvas verplaatsen" />
      {/* Linksboven */}
      <Dot className="absolute top-3 left-3" title="Canvas verplaatsen" />
      {/* Rechtsonder */}
      <Dot className="absolute bottom-3 right-3" title="Canvas verplaatsen" />
    </div>
  );
};

export default CanvasPanDots;
