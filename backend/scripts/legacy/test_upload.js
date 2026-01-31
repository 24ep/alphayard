const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function testUpload() {
    const client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        endpoint: process.env.AWS_S3_ENDPOINT || 'http://localhost:9000',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin'
        },
        forcePathStyle: true
    });

    const bucketName = process.env.AWS_S3_BUCKET || 'bondarys-files';
    const key = `test-upload-${Date.now()}.txt`;
    const body = 'Hello from MinIO check script!';

    console.log(`Attempting to upload '${key}' to bucket '${bucketName}'...`);

    try {
        await client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: body,
            ContentType: 'text/plain'
        }));
        console.log(`✅ SUCCESS: Uploaded '${key}' successfully.`);
    } catch (err) {
        console.error(`❌ FAILED: Upload failed.`, err);
    }
}

testUpload();
