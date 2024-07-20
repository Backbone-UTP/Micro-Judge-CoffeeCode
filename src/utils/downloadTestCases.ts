import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

import * as fs from 'fs';
import 'dotenv/config';

export async function downloadFilesToJudge(bucket: string) {
  if (fs.existsSync(`public/${bucket}`)) {
    console.log('Directory exists');
    const value = fs.readFileSync(`public/${bucket}/testCases`, 'utf8');
    return JSON.parse(value);
  }

  const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });

  const files = await S3.send(new ListObjectsV2Command({ Bucket: bucket }));

  const testCases = {};

  fs.mkdirSync(`public/${bucket}`, { recursive: true });
  fs.mkdirSync(`public/${bucket}/input`, { recursive: true });
  fs.mkdirSync(`public/${bucket}/answer`, { recursive: true });

  for (const file of files.Contents) {
    console.log(file);
    const filinput = await S3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: file.Key,
      }),
    );
    const name = file.Key.split('/')[1].split('.')[0];
    const type = file.Key.split('/')[0];

    if (type === 'input') {
      fs.writeFileSync(
        `public/${bucket}/input/${name}.in`,
        await filinput.Body.transformToString(),
      );
    }

    if (type === 'answer') {
      const ansContent = await filinput.Body.transformToString();
      fs.writeFileSync(`public/${bucket}/answer/${name}.ans`, ansContent);
      testCases[name] = ansContent;
    }
  }

  fs.writeFileSync(`public/${bucket}/testCases`, JSON.stringify(testCases));

  return testCases;
}
