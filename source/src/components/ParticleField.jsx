const particles = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  left: `${4 + ((index * 31) % 92)}%`,
  top: `${6 + ((index * 23) % 86)}%`,
  size: `${2 + (index % 4)}px`,
  delay: `${(index % 9) * 0.38}s`,
  duration: `${10 + (index % 8)}s`,
  driftX: `${index % 2 === 0 ? 18 : -18}px`,
  driftY: `${index % 3 === 0 ? -26 : -16}px`,
}));

const nodes = [
  { id: 1, left: '12%', top: '18%', size: '10px', delay: '0s' },
  { id: 2, left: '78%', top: '16%', size: '7px', delay: '0.6s' },
  { id: 3, left: '86%', top: '58%', size: '9px', delay: '1.1s' },
  { id: 4, left: '19%', top: '72%', size: '8px', delay: '1.7s' },
  { id: 5, left: '55%', top: '87%', size: '6px', delay: '2.2s' },
  { id: 6, left: '43%', top: '28%', size: '7px', delay: '2.8s' },
];

const ribbons = ['one', 'two', 'three'];

export default function ParticleField() {
  return (
    <div className="premium-background pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="premium-background__mesh" />
      <div className="premium-background__grid" />
      <div className="premium-background__scan" />
      <div className="premium-background__noise" />

      {ribbons.map((ribbon) => (
        <span key={ribbon} className={`premium-background__ribbon premium-background__ribbon--${ribbon}`} />
      ))}

      <span className="premium-background__orbit premium-background__orbit--one" />
      <span className="premium-background__orbit premium-background__orbit--two" />
      <span className="premium-background__orbit premium-background__orbit--three" />

      <div className="premium-background__particles">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="premium-background__particle"
            style={{
              '--particle-left': particle.left,
              '--particle-top': particle.top,
              '--particle-size': particle.size,
              '--particle-delay': particle.delay,
              '--particle-duration': particle.duration,
              '--particle-drift-x': particle.driftX,
              '--particle-drift-y': particle.driftY,
            }}
          />
        ))}
      </div>

      <div className="premium-background__nodes">
        {nodes.map((node) => (
          <span
            key={node.id}
            className="premium-background__node"
            style={{
              '--node-left': node.left,
              '--node-top': node.top,
              '--node-size': node.size,
              '--node-delay': node.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
