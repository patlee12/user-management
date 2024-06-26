import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/services/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  create(createPostDto: CreatePostDto) {
    return this.prisma.post.create({ data: createPostDto });
  }

  findAll() {
    return this.prisma.post.findMany();
  }

  getPostsByUser(authId: number) {
    return this.prisma.post.findMany({ where: { authorId: authId } });
  }

  findOne(id: number) {
    return this.prisma.post.findUnique({
      where: { id: id },
      include: { author: true },
    });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return this.prisma.post.update({ where: { id: id }, data: updatePostDto });
  }

  remove(id: number) {
    return this.prisma.post.delete({ where: { id: id } });
  }
}
