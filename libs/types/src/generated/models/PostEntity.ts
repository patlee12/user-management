/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserEntity } from './UserEntity';
export type PostEntity = {
    id: number;
    title: string;
    description?: string | null;
    body: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
    authorId: number;
    author?: UserEntity;
};

