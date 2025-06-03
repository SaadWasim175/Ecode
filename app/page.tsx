'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const App = () => {
  const router = useRouter();
  const [stars, setStars] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body {
        margin: 0;
        background: radial-gradient(ellipse at bottom, #0d1d31 0%, #0c0d13 100%);
        overflow: hidden;
        color: white;
        font-family: 'Fira Code', monospace;
      }
      .stars {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: rotate(-45deg);
        z-index: -1;
        pointer-events: none;
      }
      .star {
        position: absolute;
        width: var(--star-tail-length);
        height: var(--star-tail-height);
        background: linear-gradient(45deg, currentColor, transparent);
        border-radius: 50%;
        filter: drop-shadow(0 0 6px currentColor);
        transform: translate3d(104em, 0, 0);
        animation: fall var(--fall-duration) var(--fall-delay) linear infinite, tail-fade var(--tail-fade-duration) var(--fall-delay) ease-out infinite;
        top: var(--top-offset);
        left: var(--left-offset);
        color: var(--star-color);
      }
      .star::before, .star::after {
        position: absolute;
        content: '';
        top: 0;
        left: calc(var(--star-width) / -2);
        width: var(--star-width);
        height: 100%;
        background: linear-gradient(45deg, transparent, currentColor, transparent);
        border-radius: inherit;
        animation: blink 2s linear infinite;
      }
      .star::before { transform: rotate(45deg); }
      .star::after { transform: rotate(-45deg); }

      @keyframes fall {
        to {
          transform: translate3d(-30em, 0, 0);
        }
      }

      @keyframes tail-fade {
        0%, 50% {
          width: var(--star-tail-length);
          opacity: 1;
        }
        70%, 80% {
          width: 0;
          opacity: 0.4;
        }
        100% {
          width: 0;
          opacity: 0;
        }
      }

      @keyframes blink {
        50% {
          opacity: 0.6;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const starElements: React.ReactElement[] = [];
    for (let i = 0; i < 50; i++) {
      const styleVars = {
        '--star-tail-length': `${Math.random() * 2.5 + 2.5}em`,
        '--star-tail-height': `2px`,
        '--top-offset': `${Math.random() * 100}vh`,
        '--left-offset': `${Math.random() * 100}vw`,
        '--fall-duration': `${Math.random() * 6 + 6}s`,
        '--fall-delay': `${Math.random() * 10}s`,
        '--star-color': '#5dade2',
        '--star-width': '0.5em',
        '--tail-fade-duration': `${Math.random() * 6 + 6}s`,
      } as React.CSSProperties;
      starElements.push(<div key={i} className="star" style={styleVars} />);
    }
    setStars(starElements);
  }, []);

  // Removed all directory picker and file reading logic

  return (
    <section className="relative min-h-screen flex flex-col items-start justify-center px-24">
      <div className="stars">{stars}</div>
      <div className="z-10 max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-8">
          Get Started with Writing Code
        </h1>
        <button
          onClick={() => router.push('/editor')}
          className="px-8 py-4 rounded-xl border border-blue-500 text-white bg-[#0e1a2b] hover:bg-blue-600 hover:text-white transition duration-300 shadow-[0_0_20px_rgba(0,123,255,0.3)]"
        >
          <span className="font-semibold text-lg tracking-wide">Open Editor</span>
        </button>
      </div>
    </section>
  );
};

export default App;
