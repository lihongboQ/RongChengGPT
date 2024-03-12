import { ClassifyQuestionAgentItemType } from '../module/type';
import { SearchDataResponseItemType } from '../dataset/type';
import { ChatRoleEnum, ChatSourceEnum, ChatStatusEnum } from './constants';
import { FlowNodeTypeEnum } from '../module/node/constant';
import { ModuleOutputKeyEnum } from '../module/constants';
import { AppSchema } from '../app/type';
import { DatasetSearchModeEnum } from '../dataset/constant';

export type ChatSchema = {
  _id: string;
  chatId: string;
  userId: string;
  teamId: string;
  tmbId: string;
  appId: string;
  updateTime: Date;
  title: string;
  customTitle: string;
  top: boolean;
  variables: Record<string, any>;
  source: `${ChatSourceEnum}`;
  shareId?: string;
  outLinkUid?: string;
  content: ChatItemType[];
};

export type ChatWithAppSchema = Omit<ChatSchema, 'appId'> & {
  appId: AppSchema;
};

export type ChatItemSchema = {
  dataId: string;
  chatId: string;
  userId: string;
  teamId: string;
  tmbId: string;
  appId: string;
  time: Date;
  obj: `${ChatRoleEnum}`;
  value: string;
  userGoodFeedback?: string;
  userBadFeedback?: string;
  customFeedbacks?: string[];
  adminFeedback?: AdminFbkType;
  [ModuleOutputKeyEnum.responseData]?: ChatHistoryItemResType[];
};

export type AdminFbkType = {
  dataId: string;
  datasetId: string;
  collectionId: string;
  q: string;
  a?: string;
};

/* --------- chat item ---------- */
export type ChatItemType = {
  dataId?: string;
  obj: ChatItemSchema['obj'];
  value: any;
  userGoodFeedback?: string;
  userBadFeedback?: string;
  customFeedbacks?: ChatItemSchema['customFeedbacks'];
  adminFeedback?: ChatItemSchema['feedback'];
  [ModuleOutputKeyEnum.responseData]?: ChatHistoryItemResType[];
};

export type ChatSiteItemType = ChatItemType & {
  status: `${ChatStatusEnum}`;
  moduleName?: string;
  ttsBuffer?: Uint8Array;
};

/* ---------- history ------------- */
export type HistoryItemType = {
  chatId: string;
  updateTime: Date;
  customTitle?: string;
  title: string;
};
export type ChatHistoryItemType = HistoryItemType & {
  appId: string;
  top: boolean;
};

/* ------- response data ------------ */
export type moduleDispatchResType = {
  // common
  moduleLogo?: string;
  price?: number;
  runningTime?: number;
  tokens?: number;
  model?: string;
  query?: string;
  contextTotalLen?: number;
  textOutput?: string;

  // chat
  temperature?: number;
  maxToken?: number;
  quoteList?: SearchDataResponseItemType[];
  historyPreview?: ChatItemType[]; // completion context array. history will slice

  // dataset search
  similarity?: number;
  limit?: number;
  searchMode?: `${DatasetSearchModeEnum}`;

  // cq
  cqList?: ClassifyQuestionAgentItemType[];
  cqResult?: string;

  // content extract
  extractDescription?: string;
  extractResult?: Record<string, any>;

  // http
  body?: Record<string, any>;
  httpResult?: Record<string, any>;

  // plugin output
  pluginOutput?: Record<string, any>;
  pluginDetail?: ChatHistoryItemResType[];

  // tf switch
  tfSwitchResult?: boolean;
};

export type ChatHistoryItemResType = moduleDispatchResType & {
  moduleType: `${FlowNodeTypeEnum}`;
  moduleName: string;
};
