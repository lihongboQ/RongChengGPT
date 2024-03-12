import type {
  ChatModelItemType,
  FunctionModelItemType,
  LLMModelItemType,
  VectorModelItemType,
  AudioSpeechModels,
  WhisperModelType,
  ReRankModelItemType
} from '../../../core/ai/model.d';

/* fastgpt main */
export type FastGPTConfigFileType = {
  feConfigs: FastGPTFeConfigsType;
  systemEnv: SystemEnvType;
  chatModels: ChatModelItemType[];
  qaModels: LLMModelItemType[];
  cqModels: FunctionModelItemType[];
  extractModels: FunctionModelItemType[];
  qgModels: LLMModelItemType[];
  vectorModels: VectorModelItemType[];
  reRankModels: ReRankModelItemType[];
  audioSpeechModels: AudioSpeechModelType[];
  whisperModel: WhisperModelType;
};

export type FastGPTFeConfigsType = {
  show_emptyChat?: boolean;
  show_register?: boolean;
  show_appStore?: boolean;
  show_git?: boolean;
  show_pay?: boolean;
  show_openai_account?: boolean;
  show_promotion?: boolean;
  hide_app_flow?: boolean;
  concatMd?: string;
  docUrl?: string;
  chatbotUrl?: string;
  openAPIDocUrl?: string;
  systemTitle?: string;
  googleClientVerKey?: string;
  isPlus?: boolean;
  oauth?: {
    github?: string;
    google?: string;
  };
  limit?: {
    exportLimitMinutes?: number;
  };
  scripts?: { [key: string]: string }[];
  favicon?: string;
};

export type SystemEnvType = {
  pluginBaseUrl?: string;
  openapiPrefix?: string;
  vectorMaxProcess: number;
  qaMaxProcess: number;
  pgHNSWEfSearch: number;
};

declare global {
  var feConfigs: FastGPTFeConfigsType;
  var systemEnv: SystemEnvType;
}
