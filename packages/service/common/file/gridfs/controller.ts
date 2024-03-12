import { Types, connectionMongo } from '../../mongo';
import { BucketNameEnum } from '@fastgpt/global/common/file/constants';
import fsp from 'fs/promises';
import fs from 'fs';
import { DatasetFileSchema } from '@fastgpt/global/core/dataset/type';
import { delImgByFileIdList } from '../image/controller';

export function getGFSCollection(bucket: `${BucketNameEnum}`) {
  return connectionMongo.connection.db.collection(`${bucket}.files`);
}
export function getGridBucket(bucket: `${BucketNameEnum}`) {
  return new connectionMongo.mongo.GridFSBucket(connectionMongo.connection.db, {
    bucketName: bucket
  });
}

/* crud  file */
export async function uploadFile({
  bucketName,
  teamId,
  tmbId,
  path,
  filename,
  metadata = {}
}: {
  bucketName: `${BucketNameEnum}`;
  teamId: string;
  tmbId: string;
  path: string;
  filename: string;
  metadata?: Record<string, any>;
}) {
  if (!path) return Promise.reject(`filePath is empty`);
  if (!filename) return Promise.reject(`filename is empty`);

  const stats = await fsp.stat(path);
  if (!stats.isFile()) return Promise.reject(`${path} is not a file`);

  metadata.teamId = teamId;
  metadata.tmbId = tmbId;

  // create a gridfs bucket
  const bucket = getGridBucket(bucketName);

  const stream = bucket.openUploadStream(filename, {
    metadata,
    contentType: metadata?.contentType
  });

  // save to gridfs
  await new Promise((resolve, reject) => {
    fs.createReadStream(path)
      .pipe(stream as any)
      .on('finish', resolve)
      .on('error', reject);
  });

  return String(stream.id);
}

export async function getFileById({
  bucketName,
  fileId
}: {
  bucketName: `${BucketNameEnum}`;
  fileId: string;
}) {
  const db = getGFSCollection(bucketName);
  const file = await db.findOne<DatasetFileSchema>({
    _id: new Types.ObjectId(fileId)
  });

  // if (!file) {
  //   return Promise.reject('File not found');
  // }

  return file || undefined;
}

export async function delFileByFileIdList({
  bucketName,
  fileIdList,
  retry = 3
}: {
  bucketName: `${BucketNameEnum}`;
  fileIdList: string[];
  retry?: number;
}): Promise<any> {
  try {
    const bucket = getGridBucket(bucketName);

    await Promise.all(fileIdList.map((id) => bucket.delete(new Types.ObjectId(id))));
  } catch (error) {
    if (retry > 0) {
      return delFileByFileIdList({ bucketName, fileIdList, retry: retry - 1 });
    }
  }
}
// delete file by metadata(datasetId)
export async function delFileByMetadata({
  bucketName,
  datasetId
}: {
  bucketName: `${BucketNameEnum}`;
  datasetId?: string;
}) {
  const bucket = getGridBucket(bucketName);

  const files = await bucket
    .find(
      {
        ...(datasetId && { 'metadata.datasetId': datasetId })
      },
      {
        projection: {
          _id: 1
        }
      }
    )
    .toArray();

  const idList = files.map((item) => String(item._id));

  // delete img
  await delImgByFileIdList(idList);

  // delete file
  await delFileByFileIdList({
    bucketName,
    fileIdList: idList
  });
}

export async function getDownloadStream({
  bucketName,
  fileId
}: {
  bucketName: `${BucketNameEnum}`;
  fileId: string;
}) {
  const bucket = getGridBucket(bucketName);

  return bucket.openDownloadStream(new Types.ObjectId(fileId));
}
