import type { FC } from 'react';

import { Button } from '@proton/atoms/Button';
import { Dropdown, DropdownMenu, Icon, usePopperAnchor } from '@proton/components/index';

export const QuickActionsDropdown: FC<{ color?: 'weak' | 'norm'; disabled?: boolean; shape?: 'ghost' | 'outline' }> = ({
    children,
    color,
    disabled,
    shape,
}) => {
    const { anchorRef, isOpen, toggle, close } = usePopperAnchor<HTMLButtonElement>();

    return (
        <>
            <Button
                icon
                pill
                color={color}
                shape={shape}
                size="medium"
                ref={anchorRef}
                onClick={toggle}
                disabled={disabled}
            >
                <Icon name="three-dots-vertical" />
            </Button>

            <Dropdown isOpen={isOpen} anchorRef={anchorRef} onClose={close}>
                <DropdownMenu>{children}</DropdownMenu>
            </Dropdown>
        </>
    );
};
