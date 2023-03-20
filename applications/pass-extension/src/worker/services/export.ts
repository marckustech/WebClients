import { ExportPayload, createExportZip, decryptZip, encryptZip } from '@proton/pass/export';
import { selectShareOrThrow } from '@proton/pass/store';
import { unwrapOptimisticState } from '@proton/pass/store/optimistic/utils/transformers';
import { VaultShareContent, WorkerMessageType } from '@proton/pass/types';
import { uint8ArrayToBase64String } from '@proton/shared/lib/helpers/encoding';

import * as config from '../../app/config';
import WorkerMessageBroker from '../channel';
import { waitForContext } from '../context';
import store from '../store';

export const createExportService = () => {
    const getExportData = async (encrypted: boolean): Promise<ExportPayload> => {
        const state = store.getState();
        const itemsByShareId = unwrapOptimisticState(state.items.byShareId);

        const vaults = Object.fromEntries(
            Object.entries(itemsByShareId).map(([shareId, itemsById]) => {
                const share = selectShareOrThrow(shareId)(state);

                return [
                    shareId,
                    {
                        ...(share.content as VaultShareContent),
                        items: Object.values(itemsById).map((item) => ({
                            itemId: item.itemId,
                            shareId: item.shareId,
                            data: item.data,
                            state: item.state,
                            aliasEmail: item.aliasEmail,
                            contentFormatVersion: item.contentFormatVersion,
                        })),
                    },
                ];
            })
        );

        return {
            version: config.APP_VERSION,
            encrypted,
            vaults,
        };
    };

    WorkerMessageBroker.registerMessage(WorkerMessageType.EXPORT_REQUEST, async ({ payload }) => {
        await waitForContext(); /* make sure context initialized */
        const exportData = await getExportData(payload.encrypted);
        const zip = await createExportZip(exportData);

        return { data: payload.encrypted ? await encryptZip(zip, payload.passphrase) : uint8ArrayToBase64String(zip) };
    });

    WorkerMessageBroker.registerMessage(
        WorkerMessageType.EXPORT_DECRYPT,
        async ({ payload: { data, passphrase } }) => ({ data: await decryptZip(data, passphrase) })
    );

    return {};
};

export type ExportService = ReturnType<typeof createExportService>;
