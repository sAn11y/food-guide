import { useEffect, useRef, useState } from 'react';

interface ScribbleBadgeProps {
  type: 'circle' | 'underline';
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const circlePath = "M91.7,22.8C79.5,7.8,56,3.5,36.7,8.9C14.6,15.1,2.6,36.4,8.2,54.6c5.6,18.3,29.3,26.2,53.5,20.2 c22.8-5.6,36.7-24.8,31.4-42.2C87.8,15,78.8,6.5,59,5.8C37.1,5.1,15.2,16.3,11.4,33.3C7.7,49.7,24.3,65.9,47.2,64.6 c21.2-1.2,38.6-16.8,34.4-34.2C77.5,13.4,59.8,3.6,42,5.8C22.4,8.2,9,23.6,10.8,37.6c2.1,16,20.2,24.8,39.7,22.6 c18.6-2.1,32.8-15.6,30.2-30.6C78.4,15.7,64.6,5.3,46,7.2C28.4,9,17.3,20.5,20.3,32.6c3.3,13.3,20.5,20.5,37.3,17.4 C73.4,46.9,83.6,36,80.2,25.8C77.1,16.5,63.6,10.7,48.8,13.8C35.3,16.6,28,25.9,31.8,33.9";

const underlinePath = "M7.3,74.5c0,0,9.9-6.5,18.8-8.1c8.9-1.6,16.1,5.3,25.1,6.3c9,1,23.3-5.1,31.3-8.6 c8-3.5,16.9-7.8,16.9-7.8";

export default function ScribbleBadge({ type, children, className = '', delay = 0 }: ScribbleBadgeProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible && pathRef.current) {
      const length = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = `${length}`;
      pathRef.current.style.strokeDashoffset = `${length}`;
      requestAnimationFrame(() => {
        if (pathRef.current) {
          pathRef.current.style.animation = `scribble-draw 0.8s ease-in-out forwards`;
        }
      });
    }
  }, [isVisible]);

  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className={`scribble-svg ${type}`}
      >
        <path
          ref={pathRef}
          d={type === 'circle' ? circlePath : underlinePath}
        />
      </svg>
    </span>
  );
}
