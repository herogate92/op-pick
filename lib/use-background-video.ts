import { useSyncExternalStore } from "react";

// Decorative background video only on wide screens without reduced motion; phones keep the poster.
const motionQuery = "(min-width: 761px) and (prefers-reduced-motion: no-preference)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getMotionSnapshot = () => window.matchMedia(motionQuery).matches;
const getServerSnapshot = () => false;

export function useBackgroundVideoAllowed() {
  return useSyncExternalStore(subscribeMotion, getMotionSnapshot, getServerSnapshot);
}
