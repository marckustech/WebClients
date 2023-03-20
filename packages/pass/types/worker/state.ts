import { Maybe } from '../utils';

export enum WorkerStatus {
    IDLE = 'IDLE' /* initial worker state - pending initalization */,
    AUTHORIZING = 'AUTHORIZING' /* worker is forking a session to login */,
    UNAUTHORIZED = 'UNAUTHORIZED' /* worker is pending login */,
    AUTHORIZED = 'AUTHORIZED' /* user is logged in */,
    RESUMING = 'RESUMING' /* worker is trying to resume session */,
    RESUMING_FAILED = 'RESUMING_FAILED' /* session resuming failed */,
    BOOTING = 'BOOTING' /* worker is currently in the boot sequence */,
    READY = 'READY' /* worker is authorized and has booted */,
    ERROR = 'ERROR' /* worker is in an error state */,
}

export type WorkerState = {
    status: WorkerStatus;
    loggedIn: boolean;
    UID: Maybe<string>;
};
