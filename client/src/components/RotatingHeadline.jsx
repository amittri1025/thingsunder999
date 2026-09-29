import { useEffect, useLayoutEffect, useRef, useState } from "react";

const TRANSITION_MS = 650;
const PHRASE_INTERVAL_MS = 2600;

export default function RotatingHeadline({ phrases, ariaLabel, className = "" }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [measurements, setMeasurements] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [transitionsEnabled, setTransitionsEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return undefined;

    const measure = () => {
      const children = Array.from(track.children);
      setMeasurements(children.map((child) => ({
        height: child.getBoundingClientRect().height,
        offset: child.offsetTop,
      })));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    Array.from(track.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [phrases]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || reducedMotion || measurements.length === 0) return undefined;

    const timer = window.setTimeout(() => {
      setTransitionsEnabled(true);
      setActiveIndex((current) => Math.min(current + 1, phrases.length));
    }, PHRASE_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, measurements.length, phrases.length, reducedMotion]);

  if (!phrases.length) return null;

  const currentMeasurement = measurements[activeIndex] || measurements[0];

  function handleTransitionEnd(event) {
    if (event.target !== trackRef.current || event.propertyName !== "transform" || activeIndex !== phrases.length) return;

    setTransitionsEnabled(false);
    setActiveIndex(0);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setTransitionsEnabled(true));
    });
  }

  return (
    <span
      ref={viewportRef}
      className={`rotating-headline ${className}`.trim()}
      role="text"
      aria-label={ariaLabel || phrases[0]}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      style={currentMeasurement ? { height: `${currentMeasurement.height}px` } : undefined}
    >
      <span
        ref={trackRef}
        className={`headline-track${transitionsEnabled && !reducedMotion ? " headline-track-animated" : ""}`}
        onTransitionEnd={handleTransitionEnd}
        style={currentMeasurement ? { transform: `translateY(-${currentMeasurement.offset}px)` } : undefined}
        aria-hidden="true"
      >
        {phrases.map((phrase, index) => <span key={`${index}-${phrase}`}>{phrase}</span>)}
        <span>{phrases[0]}</span>
      </span>
    </span>
  );
}
