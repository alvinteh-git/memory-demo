import { useState, useEffect, useCallback } from 'react';
import { TicketManager } from '@/core/economy/TicketManager';
import { loadTicketConfig } from '@/utils/yaml-loader';

interface UseTicketManagerResult {
  ticketManager: TicketManager | null;
  resetTickets: () => void;
}

export const useTicketManager = (): UseTicketManagerResult => {
  const [ticketManager, setTicketManager] = useState<TicketManager | null>(null);

  // Load ticket configuration on mount
  useEffect(() => {
    loadTicketConfig('/ticket_config.yml').then(config => {
      const tm = new TicketManager(config);
      setTicketManager(tm);
    }).catch(error => {
      console.error('Failed to load ticket config:', error);
    });
  }, []);

  const resetTickets = useCallback(() => {
    if (ticketManager) {
      ticketManager.reset();
      // Force re-render by re-loading config
      loadTicketConfig('/ticket_config.yml').then(config => {
        const tm = new TicketManager(config);
        setTicketManager(tm);
      }).catch(error => {
        console.error('Failed to reload ticket config:', error);
      });
    }
  }, [ticketManager]);

  return {
    ticketManager,
    resetTickets
  };
};