/**
 * configStore — Zustand store for app configuration.
 *
 * SOURCE OF TRUTH: configService (localStorage via spa_config).
 * No Zustand persist — eliminates dual-persistence / stale-hydration bugs.
 *
 * Cross-tab sync: subscribeConfigSync() reloads when another tab writes.
 */
import { create } from 'zustand';
import type { AppConfig, ConfigOption, StepDefinition, FieldDefinition } from '../types/config';
import { defaultConfig } from '../data/defaultConfig';
import { configService } from '../services/configService';

interface ConfigState {
  config: AppConfig;
  loading: boolean;
  loadConfig: () => Promise<void>;
  updateConfig: (partial: Partial<AppConfig>) => Promise<void>;
  updateIntakeSchema: (schema: StepDefinition[]) => Promise<void>;
  updateOptionList: (key: keyof AppConfig, options: ConfigOption[]) => Promise<void>;
  updateField: (stepId: string, fieldId: string, field: FieldDefinition) => Promise<void>;
  resetConfig: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>()((set, get) => ({
  config: defaultConfig,
  loading: true,

  loadConfig: async () => {
    const config = await configService.getConfig();
    set({ config, loading: false });
  },

  updateConfig: async (partial) => {
    const updated = { ...get().config, ...partial };
    await configService.saveConfig(updated);
    set({ config: updated });
  },

  updateIntakeSchema: async (schema) => {
    const updated = { ...get().config, intakeSchema: schema };
    await configService.saveConfig(updated);
    set({ config: updated });
  },

  updateOptionList: async (key, options) => {
    const updated = { ...get().config, [key]: options };
    await configService.saveConfig(updated);
    set({ config: updated });
  },

  /** Immutably update a single field within a step */
  updateField: async (stepId, fieldId, field) => {
    const schema = get().config.intakeSchema.map((step) => {
      if (step.id !== stepId) return step;
      return {
        ...step,
        fields: step.fields.map((f) => (f.id === fieldId ? { ...field } : f)),
      };
    });
    const updated = { ...get().config, intakeSchema: schema };
    await configService.saveConfig(updated);
    set({ config: updated });
  },

  resetConfig: async () => {
    const config = await configService.resetConfig();
    set({ config });
  },
}));

const CONFIG_STORAGE_KEY = 'spa_config';

/** Cross-tab sync for config. Returns cleanup function. */
export function subscribeConfigSync(): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === CONFIG_STORAGE_KEY) {
      useConfigStore.getState().loadConfig();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
