import type { Runtime } from 'webextension-polyfill';

import { backgroundMessage } from '@proton/pass/extension/message';
import browser from '@proton/pass/globals/browser';
import type {
    Maybe,
    MessageFailure,
    MessageSuccess,
    PortFrameForwardingMessage,
    WorkerMessage,
    WorkerMessageResponse,
    WorkerMessageWithSender,
    WorkerResponse,
} from '@proton/pass/types';
import { WorkerMessageType } from '@proton/pass/types';
import { pipe, tap } from '@proton/pass/utils/fp';
import { logger } from '@proton/pass/utils/logger';

export const successMessage = <T extends {}>(message?: T) =>
    ({ type: 'success', ...(message ?? {}) } as MessageSuccess<T>);

export const errorMessage = (error?: string): MessageFailure => ({
    type: 'error',
    error: error ?? 'unknown error',
    payload: error /* needed for Proton Account auth-ext page */,
});

type MessageHandlerCallback<
    T extends WorkerMessageType = WorkerMessageType,
    M extends WorkerMessageWithSender = Extract<WorkerMessageWithSender, { type: T }>
> = (message: M, sender: Runtime.MessageSender) => WorkerMessageResponse<T> | Promise<WorkerMessageResponse<T>>;

export type ExtensionMessageBroker = ReturnType<typeof createMessageBroker>;

export const createMessageBroker = () => {
    const handlers: Map<WorkerMessageType, MessageHandlerCallback> = new Map();
    const ports: Map<string, Runtime.Port> = new Map();
    const buffer: Set<WorkerMessageWithSender> = new Set();

    const broadcast = <M extends WorkerMessage>(message: M, matchPort?: string | ((name: string) => boolean)) => {
        ports.forEach(
            (port) =>
                (matchPort === undefined ||
                    (typeof matchPort === 'string' && port.name === matchPort) ||
                    (typeof matchPort === 'function' && matchPort(port.name))) &&
                port.postMessage(backgroundMessage(message))
        );
    };

    const query = (match: (key: string) => boolean) =>
        Array.from(ports)
            .filter(([key]) => match(key))
            .map(([, port]) => port);

    const registerMessage = <T extends WorkerMessageType>(message: T, handler: MessageHandlerCallback<T>) => {
        if (handlers.has(message)) {
            throw new Error(`Message handler for "${message}" already registered`);
        }
        logger.info(`[MessageBroker::Register] Registering handler for "${message}"`);
        handlers.set(message, handler as MessageHandlerCallback);
    };

    const onMessage = async (
        message: WorkerMessageWithSender,
        sender: Runtime.MessageSender
    ): Promise<WorkerResponse<WorkerMessageWithSender> | void> => {
        /**
         * During development, while using the webpack dev-server
         * with hot module replacement - we sometimes end up in a
         * "corrupted" state where the service-worker is sending out
         * messages to itself while it is updating or going stale.
         */
        if (process.env.NODE_ENV === 'development') {
            if (message.sender === 'background') {
                browser.runtime.reload();
                return errorMessage();
            }
        }

        const handler = message.type !== undefined ? handlers.get(message.type) : undefined;

        if (handler) {
            try {
                const res = await handler(message, sender);

                if (typeof res === 'boolean' || res === undefined) {
                    if (res === false) {
                        throw new Error(`Error when processing "${message.type}"`);
                    }

                    return successMessage({});
                }

                return successMessage(res);
            } catch (error: any) {
                logger.warn(`[MessageBroker::Message] error`, error);
                return error instanceof Error ? errorMessage(error?.message) : { ...error, type: 'error' };
            }
        }
    };

    const onConnect = (port: Runtime.Port) => {
        ports.set(port.name, port);

        port.onMessage.addListener(async (message: Maybe<PortFrameForwardingMessage>) => {
            if (message && message.type === WorkerMessageType.PORT_FORWARDING_MESSAGE) {
                ports.get(message.forwardTo)?.postMessage({ ...message.payload, forwarded: true });
            }
        });

        port.onDisconnect.addListener(({ name }) => ports.delete(name));
    };

    const disconnect = () => ports.forEach((port) => port.disconnect());

    return {
        registerMessage,
        onMessage,
        buffer: {
            push: (message: WorkerMessageWithSender) => buffer.add(message),
            flush: pipe(
                () => Array.from(buffer.values()),
                tap(() => buffer.clear())
            ),
        },
        ports: {
            broadcast,
            onConnect,
            disconnect,
            query,
        },
    };
};
