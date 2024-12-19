import { useCallback, useId, useRef } from 'preact/hooks';
import { classNames } from '@blockcode/utils';

import { IconSelectorItem } from './icon-selector-item';
import styles from './icon-selector.module.css';

export function IconSelector({ className, id, displayOrder, items, selectedIndex, selectedId, onDelete, onSelect }) {
  const ref = useRef();
  const selectorId = useId();

  const wrapOnEvent = useCallback(
    (i, item, handler) => (e) => {
      e.stopPropagation();
      if (handler) handler(i, item);
    },
    [],
  );

  if (ref.current) {
    const { top } = ref.current.getBoundingClientRect();
    const height = window.innerHeight - top;
    ref.current.style.height = `${height}px`;
  }

  return (
    <div
      ref={ref}
      className={classNames(styles.iconSelectorWrapper, className)}
    >
      <div className={styles.itemsWrapper}>
        {items &&
          items.map((item, i) =>
            item.__hidden__ ? null : (
              <IconSelectorItem
                checked={i === selectedIndex || item.id === selectedId}
                displayOrder={displayOrder}
                className={classNames(styles.iconItem, item.className)}
                contextMenu={item.contextMenu}
                details={item.details}
                icon={item.icon}
                id={id ?? selectorId}
                key={item.title}
                name={i}
                order={item.order}
                title={item.name}
                onSelect={wrapOnEvent(i, item, onSelect)}
                onDelete={onDelete && wrapOnEvent(i, item, onDelete)}
              />
            ),
          )}
      </div>
    </div>
  );
}
