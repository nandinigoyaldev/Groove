import React, { useRef, useEffect } from 'react';
import type { Project } from '../types';
import { ProjectCard } from './ProjectCard';

interface GalleryScrollProps {
  projects: Project[];
  onActiveProjectChange: (proj: Project) => void;
  onOpenProject: (proj: Project) => void;
}

export const GalleryScroll: React.FC<GalleryScrollProps> = ({
  projects,
  onActiveProjectChange,
  onOpenProject,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Translate vertical wheel scroll to horizontal
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY * 1.2;
      }
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener('wheel', handleWheel);
  }, []);

  // Track scrolling to determine active item in center
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const centerPoint = container.scrollLeft + containerWidth / 2;

    const cardElements = container.querySelectorAll('.gallery-card-wrapper');
    let closestProjectIndex = 0;
    let minDistance = Infinity;

    cardElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      const cardCenter = htmlEl.offsetLeft + htmlEl.clientWidth / 2;
      const distance = Math.abs(centerPoint - cardCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestProjectIndex = index;
      }
    });

    onActiveProjectChange(projects[closestProjectIndex]);
  };

  // Click & Drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollRef.current;
    if (!container) return;

    isDragging.current = true;
    startX.current = e.pageX - container.offsetLeft;
    scrollLeftStart.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const container = scrollRef.current;
    if (!container) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX.current) * 1.5; // scroll speed multiplier
    container.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={scrollRef}
      className="gallery-scroll-container"
      onScroll={handleScroll}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
    >
      <div className="gallery-track">
        {/* Spacer at start to allow centering the first card */}
        <div className="gallery-spacer" />
        
        {projects.map((proj) => (
          <div key={proj.id} className="gallery-card-wrapper">
            <ProjectCard
              project={proj}
              onOpen={() => onOpenProject(proj)}
            />
          </div>
        ))}

        {/* Spacer at end to allow centering the last card */}
        <div className="gallery-spacer" />
      </div>
    </div>
  );
};
