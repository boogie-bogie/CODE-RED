import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from 'webapp/src/utils/utils.service';

@Injectable()
export class AwsService {
  s3Client: S3Client;

  constructor(
    private configService: ConfigService,
    private utilsService: UtilsService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    return await this.saveImageToS3(file);
  }

  private async saveImageToS3(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const fileName = `${this.utilsService.getUUID()}.${ext}`;

    const bucket = this.configService.get('AWS_S3_BUCKET_NAME');
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: `image/${ext}`,
    });

    await this.s3Client.send(command);

    return `https://s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${bucket}/${fileName}`;
  }
}
