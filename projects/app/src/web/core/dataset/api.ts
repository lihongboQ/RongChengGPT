import { GET, POST, PUT, DELETE } from '@/web/common/api/request';
import type { ParentTreePathItemType } from '@fastgpt/global/common/parentFolder/type.d';
import type { DatasetItemType, DatasetListItemType } from '@fastgpt/global/core/dataset/type.d';
import type {
  GetDatasetCollectionsProps,
  GetDatasetDataListProps,
  UpdateDatasetCollectionParams
} from '@/global/core/api/datasetReq.d';
import type {
  CreateDatasetCollectionParams,
  DatasetUpdateBody,
  PostWebsiteSyncParams
} from '@fastgpt/global/core/dataset/api.d';
import type { SearchTestProps, SearchTestResponse } from '@/global/core/dataset/api.d';
import type {
  PushDatasetDataProps,
  UpdateDatasetDataProps,
  CreateDatasetParams,
  InsertOneDatasetDataProps
} from '@/global/core/dataset/api.d';
import type { PushDataResponse } from '@/global/core/api/datasetRes.d';
import type { DatasetCollectionItemType } from '@fastgpt/global/core/dataset/type';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constant';
import type { DatasetDataItemType } from '@fastgpt/global/core/dataset/type';
import type { DatasetCollectionsListItemType } from '@/global/core/dataset/type.d';
import { PagingData } from '@/types';

/* ======================== dataset ======================= */
export const getDatasets = (data: { parentId?: string; type?: `${DatasetTypeEnum}` }) =>
  GET<DatasetListItemType[]>(`/core/dataset/list`, data);

/**
 * get type=dataset list
 */
export const getAllDataset = () => GET<DatasetListItemType[]>(`/core/dataset/allDataset`);

export const getDatasetPaths = (parentId?: string) =>
  GET<ParentTreePathItemType[]>('/core/dataset/paths', { parentId });

export const getDatasetById = (id: string) => GET<DatasetItemType>(`/core/dataset/detail?id=${id}`);

export const postCreateDataset = (data: CreateDatasetParams) =>
  POST<string>(`/core/dataset/create`, data);

export const putDatasetById = (data: DatasetUpdateBody) => PUT<void>(`/core/dataset/update`, data);

export const delDatasetById = (id: string) => DELETE(`/core/dataset/delete?id=${id}`);

export const postWebsiteSync = (data: PostWebsiteSyncParams) =>
  POST(`/plusApi/core/dataset/websiteSync`, data, {
    timeout: 600000
  }).catch();

export const getCheckExportLimit = (datasetId: string) =>
  GET(`/core/dataset/checkExportLimit`, { datasetId });

/* =========== search test ============ */
export const postSearchText = (data: SearchTestProps) =>
  POST<SearchTestResponse>(`/core/dataset/searchTest`, data);

/* ============================= collections ==================================== */
export const getDatasetCollections = (data: GetDatasetCollectionsProps) =>
  POST<PagingData<DatasetCollectionsListItemType>>(`/core/dataset/collection/list`, data);
export const getDatasetCollectionPathById = (parentId: string) =>
  GET<ParentTreePathItemType[]>(`/core/dataset/collection/paths`, { parentId });
export const getDatasetCollectionById = (id: string) =>
  GET<DatasetCollectionItemType>(`/core/dataset/collection/detail`, { id });
export const postDatasetCollection = (data: CreateDatasetCollectionParams) =>
  POST<string>(`/core/dataset/collection/create`, data);
export const putDatasetCollectionById = (data: UpdateDatasetCollectionParams) =>
  POST(`/core/dataset/collection/update`, data);
export const delDatasetCollectionById = (params: { collectionId: string }) =>
  DELETE(`/core/dataset/collection/delete`, params);
export const postLinkCollectionSync = (collectionId: string) =>
  POST(`/core/dataset/collection/sync/link`, { collectionId });

/* =============================== data ==================================== */
/* get dataset list */
export const getDatasetDataList = (data: GetDatasetDataListProps) =>
  POST(`/core/dataset/data/list`, data);

export const getDatasetDataItemById = (dataId: string) =>
  GET<DatasetDataItemType>(`/core/dataset/data/detail`, { dataId });

/**
 * push data to training queue
 */
export const postChunks2Dataset = (data: PushDatasetDataProps) =>
  POST<PushDataResponse>(`/core/dataset/data/pushData`, data);

/**
 * insert one data to dataset (immediately insert)
 */
export const postInsertData2Dataset = (data: InsertOneDatasetDataProps) =>
  POST<string>(`/core/dataset/data/insertData`, data);

/**
 * update one datasetData by id
 */
export const putDatasetDataById = (data: UpdateDatasetDataProps) =>
  PUT('/core/dataset/data/update', data);
/**
 * 删除一条知识库数据
 */
export const delOneDatasetDataById = (dataId: string) =>
  DELETE<string>(`/core/dataset/data/delete`, { dataId });

/* ================ training ==================== */
/* get length of system training queue */
export const getTrainingQueueLen = () => GET<number>(`/core/dataset/training/getQueueLen`);

/* ================== file ======================== */
export const getFileViewUrl = (fileId: string) =>
  GET<string>('/core/dataset/file/getPreviewUrl', { fileId });
