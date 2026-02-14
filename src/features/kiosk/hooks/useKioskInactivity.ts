import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKioskStore } from '../../../stores/kioskStore';
import { useConfigStore } from '../../../stores/configStore';

/** Resets kiosk to welcome screen after inactivity */
export function useKioskInactivity() {
  const reset = useKioskStore((s) => s.reset);
  const timeout = useConfigStore((s) => s.config.inactivityTimeout);
  const navigate = useNavigate();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        reset();
        navigate('/kiosk', { replace: true });
      }, timeout * 1000);
    };

    const events = ['touchstart', 'mousedown', 'keydown', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [timeout, reset, navigate]);
}
