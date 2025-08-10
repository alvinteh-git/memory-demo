import yaml from 'js-yaml';

export interface TicketConfig {
  demo: {
    enabled: boolean;
    starting_balance: number;
    allow_reset: boolean;
    show_statistics: boolean;
  };
  game: {
    cost_to_play: number;
    ticket_precision: number;
  };
  difficulty_settings: {
    [key: string]: {
      name: string;
      reward_multiplier: number;
      pattern_display_time_multiplier: number;
      response_time_multiplier: number;
      description: string;
    };
  };
  default_difficulty: string;
  base_reward: number;
  round_multipliers: number[];
  variation_bonuses: {
    none: number;
    reverse: number;
    ghost: number;
    speed_chaos: number;
    color_shuffle: number;
    selective: number;
    reverse_combo: number;
  };
  disabled_variation_penalties: {
    per_variation_penalty: number;
    max_penalty: number;
  };
  display: {
    show_balance: boolean;
    show_earned: boolean;
    show_next_reward: boolean;
    animate_rewards: boolean;
    decimal_format: string;
  };
  feedback_thresholds: {
    small: number;
    medium: number;
    large: number;
    mega: number;
  };
  animations: {
    ticket_increment_duration: number;
    per_ticket_delay: number;
    celebration_duration: number;
    balance_flash_duration: number;
  };
  sounds: {
    enabled: boolean;
    ticket_award: string;
    counting: string;
    milestone: string;
    insufficient_funds: string;
  };
  tracking: {
    save_statistics: boolean;
    track_rtp: boolean;
    track_distribution: boolean;
    max_history: number;
  };
  limits: {
    max_balance: number;
    min_balance: number;
    max_single_payout: number;
    max_round: number;
  };
  rtp_target: number;
  player_distribution: {
    [key: number]: number;
  };
}

export async function loadTicketConfig(path: string): Promise<TicketConfig> {
  try {
    const response = await fetch(path);
    const yamlText = await response.text();
    const config = yaml.load(yamlText) as TicketConfig;
    return config;
  } catch (error) {
    console.error('Failed to load ticket configuration:', error);
    throw error;
  }
}

export function parseTicketConfig(yamlText: string): TicketConfig {
  return yaml.load(yamlText) as TicketConfig;
}