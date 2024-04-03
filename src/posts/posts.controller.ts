import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FindPostQueryDto } from './dto/find-post-query.dto';

const user = {
  id: 1,
  email: 'email@email.com',
  password: 'password',
};

// TODO: apply user guard, userInfo decorator
// @UseGuards(AuthGuard('jwt'))
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
  ) {
    return await this.postsService.createPost(user.id, file, createPostDto);
  }

  @Get()
  async findAllPosts(@Query() query: FindPostQueryDto) {
    return await this.postsService.findAllPosts(
      +query.page,
      +query.pageSize,
      query.search,
    );
  }

  @Get(':postId')
  async findPost(@Param('postId') postId: string) {
    return await this.postsService.findPost(+postId);
  }

  @Patch(':postId')
  @UseInterceptors(FileInterceptor('image'))
  updatePost(
    @Param('postId') postId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updatePostDto: Partial<CreatePostDto>,
  ) {
    return this.postsService.updatePost(user.id, +postId, file, updatePostDto);
  }

  @Delete(':postId')
  removePost(@Param('postId') postId: string) {
    return this.postsService.removePost(user.id, +postId);
  }
}
