/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePostDto } from '../models/CreatePostDto';
import type { PostEntity } from '../models/PostEntity';
import type { UpdatePostDto } from '../models/UpdatePostDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PostsService {
    /**
     * @param requestBody
     * @returns PostEntity
     * @throws ApiError
     */
    public static postsControllerCreate(
        requestBody: CreatePostDto,
    ): CancelablePromise<PostEntity> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/posts',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns PostEntity
     * @throws ApiError
     */
    public static postsControllerFindAll(): CancelablePromise<Array<PostEntity>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/posts',
        });
    }
    /**
     * @param authorId
     * @returns PostEntity
     * @throws ApiError
     */
    public static postsControllerGetAuthorPosts(
        authorId: number,
    ): CancelablePromise<Array<PostEntity>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/posts/byAuthor/{authorId}',
            path: {
                'authorId': authorId,
            },
        });
    }
    /**
     * @param id
     * @returns PostEntity
     * @throws ApiError
     */
    public static postsControllerFindOne(
        id: number,
    ): CancelablePromise<PostEntity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/posts/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns PostEntity
     * @throws ApiError
     */
    public static postsControllerUpdate(
        id: number,
        requestBody: UpdatePostDto,
    ): CancelablePromise<PostEntity> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/posts/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns PostEntity
     * @throws ApiError
     */
    public static postsControllerRemove(
        id: number,
    ): CancelablePromise<PostEntity> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/posts/{id}',
            path: {
                'id': id,
            },
        });
    }
}
