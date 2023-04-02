import type { VFC } from 'react';

import { Form, type FormikContextType } from 'formik';
import { c } from 'ttag';

import { VaultColor as VaultColorEnum, VaultIcon as VaultIconEnum } from '@proton/pass/types/protobuf/vault-v1';

import { FieldsetCluster } from '../../components/Controls/FieldsetCluster';
import { RadioButton } from '../../components/Controls/RadioButtonGroup';
import { Field } from '../../components/Fields/Field';
import { RadioButtonGroupFieldWIP } from '../../components/Fields/RadioButtonGroupField';
import { TitleField } from '../../components/Fields/TitleField';
import { VaultIcon } from '../../components/Vault/VaultIcon';
import { VAULT_COLORS, VAULT_ICONS } from '../../components/Vault/constants';

export type VaultFormValues = { name: string; description: string; color: VaultColorEnum; icon: VaultIconEnum };
type Props = { formId: string; form: FormikContextType<VaultFormValues> };

export const VaultForm: VFC<Props> = ({ formId, form }) => {
    return (
        <Form id={formId} className="flex flex-column gap-y-4">
            <div className="flex flex-align-items-center gap-x-3">
                <VaultIcon color={form.values.color} icon={form.values.icon} />
                <div className="flex-item-fluid">
                    <FieldsetCluster>
                        <Field
                            name="name"
                            component={TitleField}
                            label={c('Label').t`Title`}
                            placeholder={c('Placeholder').t`Untitled`}
                        />
                    </FieldsetCluster>
                </div>
            </div>

            <Field
                name="color"
                component={RadioButtonGroupFieldWIP}
                className="flex-justify-space-between gap-x-6 gap-y-4"
            >
                {VAULT_COLORS.map(([vaultColor, rgb]) => (
                    <RadioButton<VaultColorEnum> key={`vault-color-${vaultColor}`} value={vaultColor} color={rgb} />
                ))}
            </Field>

            <Field
                name="icon"
                component={RadioButtonGroupFieldWIP}
                className="flex-justify-space-between gap-x-6 gap-y-4"
            >
                {VAULT_ICONS.map(([vaultIcon, icon]) => (
                    <RadioButton<VaultIconEnum> key={`vault-icon-${vaultIcon}`} value={vaultIcon} icon={icon} />
                ))}
            </Field>
        </Form>
    );
};
