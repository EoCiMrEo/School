// Simple WebSocket hook with auto-reconnect
import { useEffect, useRef } from "react";

export default function useWebSocket(
  url,
  { onMessage, onOpen, onClose, retryDelay = 1500 } = {}
) {
  const wsRef = useRef(null);
  const retryRef = useRef(null);

  useEffect(() => {
    let active = true;

    function connect() {
      try {
        // Try proxied URL first
        let targetUrl = url;
        const isLocal =
          typeof location !== "undefined" &&
          /localhost|127\.0\.0\.1/.test(location.host);
        // If dev and proxy fails repeatedly, try direct to backend on :8000
        if (isLocal && url.startsWith("ws://")) {
          const direct = url.replace(location.host, "localhost:8000");
          // If previous attempt existed and was on proxy port, switch to direct
          if (url.includes(":4028")) {
            targetUrl = direct;
          }
        }

        const ws = new WebSocket(targetUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (onOpen) onOpen();
        };

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (onMessage) onMessage(data);
          } catch (e) {
            // Ignore non-JSON frames
          }
        };

        ws.onclose = () => {
          if (onClose) onClose();
          if (active) {
            // Exponential backoff (cap at 10s)
            const nextDelay = Math.min(retryDelay * 2, 10000);
            retryRef.current = setTimeout(() => connect(), nextDelay);
          }
        };

        ws.onerror = () => {
          try {
            ws.close();
          } catch (e) {}
        };
      } catch (e) {
        const nextDelay = Math.min(retryDelay * 2, 10000);
        retryRef.current = setTimeout(() => connect(), nextDelay);
      }
    }

    connect();
    return () => {
      active = false;
      if (retryRef.current) clearTimeout(retryRef.current);
      try {
        if (wsRef.current) wsRef.current.close();
      } catch (e) {}
    };
  }, [url]);
}
