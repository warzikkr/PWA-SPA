import { supabase } from '../lib/supabaseClient';
import type { AppConfig } from '../types/config';
import { defaultConfig } from '../data/defaultConfig';

/** Single-row config table. Uses a fixed ID for the singleton row. */
const CONFIG_ROW_ID = '00000000-0000-0000-0000-000000000001';

export const configService = {
  async getConfig(): Promise<AppConfig> {
    const { data, error } = await supabase
      .from('app_config')
      .select('config')
      .eq('id', CONFIG_ROW_ID)
      .maybeSingle();
    if (error) throw new Error(`configService.getConfig: ${error.message}`);
    if (!data || !data.config || Object.keys(data.config).length === 0) {
      return defaultConfig;
    }
    // Merge with defaultConfig to fill any missing keys
    return { ...defaultConfig, ...(data.config as Partial<AppConfig>) };
  },

  async saveConfig(config: AppConfig): Promise<void> {
    const { error } = await supabase
      .from('app_config')
      .update({ config })
      .eq('id', CONFIG_ROW_ID);
    if (error) throw new Error(`configService.saveConfig: ${error.message}`);
  },

  async resetConfig(): Promise<AppConfig> {
    const { error } = await supabase
      .from('app_config')
      .update({ config: {} })
      .eq('id', CONFIG_ROW_ID);
    if (error) throw new Error(`configService.resetConfig: ${error.message}`);
    return defaultConfig;
  },
};
