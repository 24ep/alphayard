import dotenv from 'dotenv';
import path from 'path';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

// Mock the priority we want to fix
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Backend .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // Root .env

async function testMinio() {
    const s3Config = {
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
        endpoint: process.env.AWS_S3_ENDPOINT || 'http://localhost:9000',
        forcePathStyle: true,
    };

    console.log('Testing MinIO with config:', {
        endpoint: s3Config.endpoint,
        bucket: process.env.AWS_S3_BUCKET,
        key: s3Config.credentials.accessKeyId
    });

    const client = new S3Client(s3Config);
    try {
        const response = await client.send(new ListBucketsCommand({}));
        console.log('✅ Connection successful!');
        console.log('Buckets found:', response.Buckets?.map(b => b.Name));
    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
}

testMinio();
