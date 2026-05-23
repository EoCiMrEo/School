import React, { useEffect, useState, useCallback } from 'react';
import gameService from '../../utils/gameService';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';

const POLL_INTERVAL = 5000; // 5s

const QueueBadge = () => {
  const { user } = useAuth();
  const [inQueue, setInQueue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!user?.id) return;
    setChecking(true);
    try {
      const res = await gameService.isInMatchmaking(user.id);
      if (res.success) {
        setInQueue(Boolean(res.data?.in_queue));
      }
    } catch (e) {
      // ignore
    } finally {
      setChecking(false);
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;
    if (!user?.id) return;
    checkStatus();
    const t = setInterval(() => {
      if (mounted) checkStatus();
    }, POLL_INTERVAL);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [user?.id, checkStatus]);

  const handleLeave = async (e) => {
    e.stopPropagation();
    if (!user?.id) return;
    setLoading(true);
    try {
      await gameService.leaveMatchmaking(user.id);
      setInQueue(false);
    } catch (err) {
      console.error('Failed to leave matchmaking:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.id) return null;

  return (
    <div className="flex items-center space-x-2">
      {inQueue ? (
        <div className="flex items-center space-x-2 bg-warning/10 border border-warning rounded-full px-3 py-1 text-sm text-warning">
          <span className="font-medium">In Queue</span>
          <button
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-warning/20"
            onClick={handleLeave}
            aria-label="Leave queue"
            disabled={loading}
          >
            <Icon name="X" size={14} color="var(--color-warning)" />
          </button>
        </div>
      ) : (
        <div className="text-sm text-text-secondary">Not searching</div>
      )}
    </div>
  );
};

export default QueueBadge;
