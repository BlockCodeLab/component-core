import { useEffect, useRef } from 'preact/hooks';
import { classNames } from '@blockcode/utils';
import { createPopper } from '@popperjs/core/lib/popper-lite';
import offsetModifier from '@popperjs/core/lib/modifiers/offset';
import arrowModifier from '@popperjs/core/lib/modifiers/arrow';
import styles from './tooltip.module.css';

export function Tooltip({ content, className, placement, offset, clickable, children, onShow, onHide }) {
  const tooltipRef = useRef(null);

  const tooltipId = `${Math.random().toString(36).slice(2)}_tooltip`;

  useEffect(() => {
    if (tooltipRef.current) {
      const tooltipForElement = tooltipRef.current.previousElementSibling;
      tooltipForElement.setAttribute('aria-describedby', tooltipId);

      const popper = createPopper(tooltipForElement, tooltipRef.current, {
        placement: placement || 'auto',
        modifiers: [
          arrowModifier,
          offsetModifier,
          {
            name: 'offset',
            options: {
              offset: offset || [0, 8],
            },
          },
        ],
      });
      tooltipRef.popper = popper;

      const hide = () => {
        delete tooltipRef.current.dataset.show;
        popper.setOptions((options) => ({
          ...options,
          modifiers: [...options.modifiers, { name: 'eventListeners', enabled: false }],
        }));
        if (onHide) onHide();
      };

      const show = () => {
        tooltipRef.current.dataset.show = true;
        popper.setOptions((options) => ({
          ...options,
          modifiers: [...options.modifiers, { name: 'eventListeners', enabled: true }],
        }));
        popper.update();
        if (onShow) onShow();

        const clickHide = () => {
          hide();
          document.removeEventListener('mousedown', clickHide);
        };
        document.addEventListener('mousedown', clickHide);
      };

      if (clickable) {
        tooltipForElement.addEventListener('mouseup', show);
        tooltipRef.current.addEventListener('mousedown', (e) => e.stopPropagation());
      } else {
        [
          ['mouseenter', show],
          ['mouseleave', hide],
        ].forEach(([event, listener]) => tooltipForElement.addEventListener(event, listener));
      }
    }
    return () => {};
  }, [tooltipRef]);

  return (
    <>
      {children}
      <div
        ref={tooltipRef}
        id={tooltipId}
        className={classNames(styles.tooltip, className)}
        role="tooltip"
      >
        {content}
        <div
          className={styles.arrow}
          data-popper-arrow
        ></div>
      </div>
    </>
  );
}
