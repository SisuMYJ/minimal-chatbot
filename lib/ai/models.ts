// Define your models here.
export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gpt-5.5',
    label: 'GPT-5.5',
    apiIdentifier: 'openai/gpt-5.5',
    description: 'OpenAI 旗舰·说话最对味·默认',
  },
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o mini',
    apiIdentifier: 'openai/gpt-4o-mini',
    description: 'GPT 系轻量·又快又便宜·日常',
  },
  {
    id: 'claude-opus',
    label: 'Claude Opus 4.8',
    apiIdentifier: 'anthropic/claude-opus-4.8',
    description: '最强深聊·文学哲学·贵',
  },
  {
    id: 'claude-sonnet',
    label: 'Claude Sonnet 4.6',
    apiIdentifier: 'anthropic/claude-sonnet-4.6',
    description: '能打又便宜些·中间档',
  },
  {
    id: 'gemini-3-flash',
    label: 'Gemini 3 Flash',
    apiIdentifier: 'google/gemini-3-flash-preview',
    description: '快·联网强·预览版可能不稳',
  },
  {
    id: 'deepseek-v4-pro',
    label: 'DeepSeek V4 Pro',
    apiIdentifier: 'deepseek/deepseek-v4-pro',
    description: '中文好·审查松·超便宜',
  },
  {
    id: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
    apiIdentifier: 'deepseek/deepseek-v4-flash',
    description: '最省钱·日常轻量',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gpt-5.5';
