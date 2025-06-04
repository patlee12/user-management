/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserEntity = {
    id: number;
    username: string;
    name: string;
    email: string;
    mfaEnabled: boolean;
    emailVerified: boolean;
    acceptedTermsAt?: string | null;
    termsVersion?: string | null;
    userRoles?: Array<string> | null;
    loginType: UserEntity.loginType;
    createdAt: string;
    updatedAt: string;
};
export namespace UserEntity {
    export enum loginType {
        LOCAL = 'local',
        OAUTH = 'oauth',
    }
}

