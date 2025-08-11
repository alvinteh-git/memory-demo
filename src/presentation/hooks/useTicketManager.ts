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
    // Use base URL for GitHub Pages compatibility
    const configPath = import.meta.env.BASE_URL + 'ticket_config.yml';
    loadTicketConfig(configPath).then(config => {
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
      const configPath = import.meta.env.BASE_URL + 'ticket_config.yml';
      loadTicketConfig(configPath).then(config => {
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