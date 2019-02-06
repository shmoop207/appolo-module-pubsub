import {IModuleOptions} from 'appolo';

export interface IOptions extends IModuleOptions {
    id?: string;
    connection: string;
    auto?: boolean;
}