const { S3Client, ListBucketsCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');

async function checkBucket() {
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
    console.log(`Checking for bucket: ${bucketName}...`);

    try {
        const { Buckets } = await client.send(new ListBucketsCommand({}));
        const exists = Buckets.some(b => b.Name === bucketName);
        
        if (exists) {
            console.log(`✅ Bucket '${bucketName}' exists.`);
        } else {
            console.log(`⚠️ Bucket '${bucketName}' does NOT exist. Creating...`);
            await client.send(new CreateBucketCommand({ Bucket: bucketName }));
            console.log(`✅ Bucket '${bucketName}' created successfully.`);
        }
    } catch (err) {
        console.error('❌ Error checking/creating bucket:', err);
    }
}

checkBucket();
