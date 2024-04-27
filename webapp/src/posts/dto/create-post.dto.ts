import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostStatus } from 'webapp/src/common/types/post-status.type';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(PostStatus)
  @IsOptional()
  @Transform((param) => param.value.toUpperCase())
  status: PostStatus = PostStatus.AVAILABLE;
}
