import { useCallback, useState } from 'react';

export default function useMouseParallax(strength = 18) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength;
      setPosition({ x, y });
    },
    [strength],
  );

  const reset = useCallback(() => setPosition({ x: 0, y: 0 }), []);

  return {
    position,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: reset,
    },
  };
}
