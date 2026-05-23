import { useEffect, useRef, useState } from 'react';
import { supabase } from '../utils/supabase';

export const useRealtime = (table, callback, filter = null) => {
  const subscriptionRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const setupSubscription = () => {
      const channelName = filter ? `${table}_${filter}` : table;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            ...(filter && { filter: filter })
          },
          (payload) => {
            if (isMounted && callback) {
              callback(payload);
            }
          }
        )
        .subscribe((status) => {
          if (isMounted) {
            setIsConnected(status === 'SUBSCRIBED');
          }
        });

      subscriptionRef.current = channel;
    };

    setupSubscription();

    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [table, filter, callback]);

  const disconnect = () => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
      setIsConnected(false);
    }
  };

  return { isConnected, disconnect };
};

export default useRealtime;