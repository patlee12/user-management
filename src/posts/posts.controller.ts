import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PostEntity } from './entities/post.entity';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiCreatedResponse({ type: PostEntity })
  async create(@Body() createPostDto: CreatePostDto) {
    return new PostEntity(await this.postsService.create(createPostDto));
  }

  @Get()
  @ApiOkResponse({ type: PostEntity, isArray: true })
  async findAll() {
    const posts = await this.postsService.findAll();
    return posts.map((post) => new PostEntity(post));
  }

  @Get('byAuthor/:authorId')
  @ApiOkResponse({ type: PostEntity, isArray: true })
  async getAuthorPosts(@Param('authorId', ParseIntPipe) authorId: number) {
    const posts = await this.postsService.getPostsByUser(authorId);
    if (!posts) {
      throw new NotFoundException(
        `Posts with author id ${authorId} do not exist.`,
      );
    }
    return posts.map((post) => new PostEntity(post));
  }

  @Get(':id')
  @ApiOkResponse({ type: PostEntity })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException(`Post id ${id} does not exist.`);
    }
    return new PostEntity(post);
  }
  @Patch(':id')
  @ApiOkResponse({ type: PostEntity })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const updatePost = await this.postsService.update(id, updatePostDto);
    if (!updatePost) {
      throw new NotFoundException(
        `Post id ${id} was not updated. Verify correct id is being used.`,
      );
    }
    return new PostEntity(updatePost);
  }

  @Delete(':id')
  @ApiOkResponse({ type: PostEntity })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deletePost = await this.postsService.remove(id);
    if (!deletePost) {
      throw new NotFoundException(
        `Post id ${id} was not deleted. Verify correct id is being used.`,
      );
    }
    return new PostEntity(deletePost);
  }
}
