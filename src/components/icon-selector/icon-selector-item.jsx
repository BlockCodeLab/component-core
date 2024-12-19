import { classNames } from '@blockcode/utils';

import { ContextMenu } from '../context-menu/context-menu';
import { DeleteButton } from './delete-button';
import styles from './icon-selector-item.module.css';

export function IconSelectorItem({
  id,
  name,
  title,
  details,
  icon,
  order,
  checked,
  displayOrder,
  className,
  onSelect,
  onDelete,
  contextMenu,
}) {
  return (
    <ContextMenu menuItems={contextMenu}>
      <input
        checked={checked}
        className={styles.selector}
        id={`${id}-icon-${name}`}
        name={`${id}-icon`}
        type="radio"
        value={name}
      />
      <label
        className={classNames(styles.iconSelectorItem, className)}
        for={`${id}-icon-${name}`}
        onClick={onSelect}
      >
        <div className={styles.iconOuter}>
          <img
            className={styles.iconInner}
            src={icon}
          />
          {displayOrder && <div className={styles.iconOrder}>{order + 1}</div>}
        </div>
        <div className={styles.iconInfo}>
          <div className={styles.iconTitle}>{title}</div>
          {details && <div className={styles.iconDetails}>{details}</div>}
        </div>
        {onDelete && (
          <DeleteButton
            className={styles.deleteButton}
            onClick={onDelete}
          />
        )}
      </label>
    </ContextMenu>
  );
}
