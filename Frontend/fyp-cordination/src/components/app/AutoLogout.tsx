"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/auth/authThunk";
import { toast } from "@/components/ui/use-toast";

// 30 minutes in milliseconds
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export default function AutoLogout() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only set the timer if the user is logged in
    if (user) {
      timeoutRef.current = setTimeout(() => {
        dispatch(logout()).then(() => {
          toast({
            title: "Session Expired",
            description: "You have been automatically logged out due to inactivity.",
            variant: "destructive",
          });
          // Note: Next.js or the Redux state change will handle the redirect to login
        });
      }, IDLE_TIMEOUT_MS);
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Only attach event listeners if user is logged in
    if (!user) return;

    // List of events that indicate user activity
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    const handleActivity = () => {
      // Use requestAnimationFrame or throttling in a massive app, 
      // but for this, simply resetting the timer is usually fine 
      // because clearTimeout is cheap.
      resetTimer();
    };

    // Attach listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial start
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer, user]);

  return null; // This component doesn't render anything
}
