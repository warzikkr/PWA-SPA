import type { AppConfig } from '../types/config';
import { defaultConfig } from '../data/defaultConfig';
import { getItem, setItem } from './storage';

const KEY = 'config';

/** TODO: replace with real API calls */
export const configService = {
  async getConfig(): Promise<AppConfig> {
    return getItem<AppConfig>(KEY, defaultConfig);
  },

  async saveConfig(config: AppConfig): Promise<void> {
    setItem(KEY, config);
  },

  async resetConfig(): Promise<AppConfig> {
    setItem(KEY, defaultConfig);
    return defaultConfig;
  },
};
