import { S3Client } from '@aws-sdk/client-s3';

// Garage S3 is fully compatible with the S3 API.
export const garageS3Client = new S3Client({
  region: 'garage',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:3900', // S3 API of Garage
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Crucial for Garage S3 compatibility
});
