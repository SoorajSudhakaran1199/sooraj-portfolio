import { motion } from 'framer-motion';
import { fadeUp } from '../animations/variants.js';

export default function ScrollReveal({ children, className = '', delay = 0, as = 'div' }) {
  const Component = motion[as];

  return (
    <Component
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.22 }}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}
