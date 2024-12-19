import { useEffect, useRef, useId } from 'preact/hooks';
import { createPopper } from '@popperjs/core/lib/popper-lite';
import { classNames } from '@blockcode/utils';

import { Menu, MenuItem, MenuSection } from '../menu/menu';
import styles from './context-menu.module.css';

const mapMenuItems = (menuItems) =>
  menuItems.map((item, index) =>
    Array.isArray(item) ? (
      <MenuSection key={index}>{mapMenuItems(item)}</MenuSection>
    ) : (
      <MenuItem
        key={index}
        disabled={item.disabled}
        className={item.className}
        style={item.style}
        onClick={item.onClick}
      >
        {item.label}
      </MenuItem>
    ),
  );

const generateGetBoundingClientRect =
  (x = 0, y = 0) =>
  () => ({
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x,
  });

export function ContextMenu({ menuItems, className, children }) {
  const contextRef = useRef(null);
  const contextId = useId();
  useEffect(() => {
    if (contextRef.current) {
      const contextForElement = contextRef.current.previousElementSibling;

      const virtualElement = {
        getBoundingClientRect: generateGetBoundingClientRect(),
      };

      const popper = createPopper(virtualElement, contextRef.current, {
        placement: 'bottom-end',
      });

      const hide = (e) => {
        if (contextRef.current) {
          delete contextRef.current.dataset.show;
          popper.setOptions((options) => ({
            ...options,
            modifiers: [...options.modifiers, { name: 'eventListeners', enabled: false }],
          }));
        }
        document.removeEventListener('click', hide);
        document.removeEventListener('mousedown', hide);
      };

      const show = (e) => {
        e.preventDefault();

        virtualElement.getBoundingClientRect = generateGetBoundingClientRect(e.clientX, e.clientY);

        contextRef.current.dataset.show = true;
        popper.setOptions((options) => ({
          ...options,
          modifiers: [...options.modifiers, { name: 'eventListeners', enabled: true }],
        }));
        popper.update();
        setTimeout(() => {
          document.addEventListener('click', hide);
          document.addEventListener('mousedown', hide);
        });
      };
      contextForElement.addEventListener('contextmenu', show);
    }
    return () => {};
  }, [contextRef]);

  return (
    <>
      {children}
      <div
        ref={contextRef}
        id={contextId}
        className={styles.contextMenuWrapper}
        role="context"
      >
        {menuItems && (
          <Menu
            name={contextId}
            className={classNames(styles.contextMenu, className)}
          >
            {mapMenuItems(menuItems)}
          </Menu>
        )}
      </div>
    </>
  );
}
