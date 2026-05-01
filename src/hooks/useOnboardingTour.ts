import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_KEY = "xvl_chat_tour_v1";

export function useOnboardingTour(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(TOUR_KEY)) return;

    // Wait for elements to mount
    const id = setTimeout(() => {
      const d = driver({
        showProgress: true,
        allowClose: true,
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Got it",
        popoverClass: "xvl-tour",
        steps: [
          {
            element: '[data-tour="sidebar-toggle"], [data-tour="new-chat"]',
            popover: {
              title: "Welcome to XViralLabs 👋",
              description:
                "This is your AI workspace for X virality. Let me show you around in 30 seconds — tap <b>Next</b>.",
            },
          },
          {
            element: '[data-tour="tools"]',
            popover: {
              title: "Pick a tool",
              description:
                "Tap any pill (<b>Analyze</b>, <b>Generate</b>, <b>Sales</b>, <b>Video</b>) to put the AI in agent mode for that task. Tap again to clear.",
            },
          },
          {
            element: '[data-tour="plus-menu"]',
            popover: {
              title: "More tools",
              description:
                "Tap the <b>+</b> for extra tools: Thread, Rewrite, Daily Feed, Content OS, Content Lab.",
            },
          },
          {
            element: '[data-tour="send"]',
            popover: {
              title: "Just type & send",
              description:
                "Write what you want — a topic, a tweet to analyze, or any direction. Each send uses <b>1 credit</b>.",
            },
          },
          {
            element: '[data-tour="credits"]',
            popover: {
              title: "Your credits",
              description: "This shows your remaining daily credits. ∞ means unlimited.",
            },
          },
          {
            element: '[data-tour="history"]',
            popover: {
              title: "Your chat history",
              description:
                "Every chat, analysis & generation lives here. Filter by tool, search, or pin favorites.",
            },
          },
          {
            element: '[data-tour="settings"]',
            popover: {
              title: "Settings & extras",
              description:
                "Open <b>Settings</b> to manage your <b>Memory</b>, <b>Sales Engine</b>, <b>Growth tracker</b>, <b>Plans</b> and account.",
            },
          },
          {
            popover: {
              title: "You're all set 🚀",
              description:
                "Pick a tool, type your idea, hit send. You can replay this tour anytime from <b>Settings → Replay tour</b>.",
            },
          },
        ],
        onDestroyStarted: () => {
          localStorage.setItem(TOUR_KEY, "1");
          d.destroy();
        },
      });
      d.drive();
    }, 600);

    return () => clearTimeout(id);
  }, [ready]);
}

export function replayOnboardingTour() {
  localStorage.removeItem("xvl_chat_tour_v1");
  window.location.reload();
}