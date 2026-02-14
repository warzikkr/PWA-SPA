import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'spa_config_store',
      partialize: (state) => ({ config: state.config }),
    },
  ),
);
