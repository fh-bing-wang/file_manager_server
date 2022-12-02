import { S3Client, ListObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import express from 'express';

const bucketName = 'bingtrial';
const region = 'ap-northeast-1';

const s3 = new S3Client({
    region,
});

const fetchData = async () => {
    try {
        const command = new ListObjectsCommand({
            Bucket: bucketName,
        });
        const data = await s3.send(command);

        const fileUrls = data.Contents.map((content) => `https://${bucketName}.s3.${region}.amazonaws.com/${content.Key}`);
        return fileUrls;
    } catch (err) {
        console.log("Fetch Data Error: ", err);
    }
};

const saveData = async (name, file) => {
    try {
        const input = {
            Bucket: bucketName,
            Key: name,
            Body: file,
            ServerSideEncryption: 'AES256',
        };
        const command = new PutObjectCommand(input);
        const data = await s3.send(command);
    } catch (err) {
        console.log("Save Data Error: ", err);
    }
};

const hostname = '127.0.0.1';
const port = 3001;
const app = express();

app.use(express.urlencoded({ extended: true })); 
app.get("/api", async (req, res) => {
    const response = await fetchData();
    res.json({ response });
});

app.post(
    "/upload/:file_name",
    express.raw({type: ["image/jpeg", "image/png"], limit: "5mb"}),
    async (req, res) => {
        const { body } = req;
        console.log('req: ', body);
        const { file_name }=req.params;
        console.log('file_name: ', file_name)
        await saveData(file_name, body);

        res.json({ message: 'upload' });
    }
);

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
