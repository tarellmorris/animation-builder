import React from 'react';
import { useBreakpoint, DEVICE_BREAKPOINT_TYPES } from '@uber/dotcom-utils';
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';

import type { ReactNode } from 'react';

type AnimationWrapperT = {
  animations:
    | {
        desktop: [];
        tablet: [];
        mobile: [];
      }
    | undefined
    | null;
  target: string;
  observer: IntersectionObserverEntry | undefined | null;
  children: ReactNode;
};

export type AnimationWrapperProps = {
  animations?: {
    desktop: [];
    tablet: [];
    mobile: [];
  } | null;
  observer?: IntersectionObserverEntry | null;
};

export const OBSERVER_THRESHOLD = 0.35;
export const OBSERVER_ROOT_MARGIN = '0px';

const DEVICES = ['mobile', 'tablet', 'desktop'];
const DELAY_RATE = 150;
const ANIMATION_TIMING = 'cubic-bezier(0,0,0,1)';
const KEY_FRAMES = {
  '@keyframes fadeIn': {
    from: { opacity: 0, animationTimingFunction: ANIMATION_TIMING },
    to: { opacity: 1 },
  },
  '@keyframes fadeFromTop': {
    from: {
      opacity: 0,
      transform: 'translateY(-50px)',
      animationTimingFunction: ANIMATION_TIMING,
    },
    to: { opacity: 1, transform: 'translateY(0px)' },
  },
  '@keyframes fadeFromBottom': {
    from: {
      opacity: 0,
      transform: 'translateY(50px)',
      animationTimingFunction: ANIMATION_TIMING,
    },
    to: { opacity: 1, transform: 'translateY(0px)' },
  },
  '@keyframes fadeFromLeft': {
    from: {
      opacity: 0,
      transform: 'translateX(50px)',
      animationTimingFunction: ANIMATION_TIMING,
    },
    to: { opacity: 1, transform: 'translateX(0px)' },
  },
  '@keyframes fadeFromRight': {
    from: {
      opacity: 0,
      transform: 'translateX(50px)',
      animationTimingFunction: ANIMATION_TIMING,
    },
    to: { opacity: 1, transform: 'translateX(0px)' },
  },
};

export const AnimationWrapper = React.forwardRef<HTMLDivElement, AnimationWrapperT>(
  (props: AnimationWrapperT, ref) => {
    const { observer, target, animations, children, ...rest } = props;
    const [, theme] = useStyletron();
    const { currentBreakpoint } = useBreakpoint();
    const isDesktop = currentBreakpoint === DEVICE_BREAKPOINT_TYPES.DESKTOP;
    const isTablet = currentBreakpoint === DEVICE_BREAKPOINT_TYPES.TABLET;
    const isMobile = currentBreakpoint === DEVICE_BREAKPOINT_TYPES.MOBILE;
    const animationDuration = theme.animation.timing1000;

    const animationStyles = DEVICES.map((device) => {
      const filteredAnimations = animations?.[device]?.filter(
        (animation) => animation[0] === target
      );

      if (filteredAnimations && filteredAnimations?.length > 0) {
        const END_OF_ARRAY = filteredAnimations.length - 1;
        const animationName = filteredAnimations[END_OF_ARRAY]?.[1];
        const animationDelay = `${filteredAnimations[END_OF_ARRAY]?.[2] * DELAY_RATE}ms`;

        if (animationName && animationDelay && observer) {
          let isVisible;

          if (observer.intersectionRatio > 0) {
            isVisible = true;
          }

          return {
            ...KEY_FRAMES,
            opacity: 0,
            animationFillMode: 'forwards',
            animationName: isVisible ? animationName : '',
            animationDelay: animationDelay,
            animationDuration: animationDuration,
          };
        }
      }
    });

    const BLOCK_PROPS = {
      ...rest,
      ref: ref,
      id: 'animation-wrapper',
    };

    const ANIMATION_STYLES_DEVICE_MAP = {
      MOBILE: animationStyles[0] || {},
      TABLET: animationStyles[1] || {},
      DESKTOP: animationStyles[2] || {},
    };

    if (isMobile)
      return (
        <Block
          {...BLOCK_PROPS}
          overrides={{ Block: { style: { ...ANIMATION_STYLES_DEVICE_MAP.MOBILE } } }}
        >
          {children}
        </Block>
      );

    if (isTablet) {
      return (
        <Block
          {...BLOCK_PROPS}
          overrides={{
            Block: {
              style:
                Object.keys(ANIMATION_STYLES_DEVICE_MAP.TABLET).length > 0
                  ? { ...ANIMATION_STYLES_DEVICE_MAP.TABLET }
                  : { ...ANIMATION_STYLES_DEVICE_MAP.MOBILE },
            },
          }}
        >
          {children}
        </Block>
      );
    }

    if (isDesktop) {
      if (Object.keys(ANIMATION_STYLES_DEVICE_MAP.DESKTOP).length > 0) {
        return (
          <Block
            {...BLOCK_PROPS}
            overrides={{
              Block: {
                style: { ...ANIMATION_STYLES_DEVICE_MAP.DESKTOP },
              },
            }}
          >
            {children}
          </Block>
        );
      }
      if (Object.keys(ANIMATION_STYLES_DEVICE_MAP.TABLET).length > 0) {
        return (
          <Block
            {...BLOCK_PROPS}
            overrides={{
              Block: {
                style: { ...ANIMATION_STYLES_DEVICE_MAP.TABLET },
              },
            }}
          >
            {children}
          </Block>
        );
      }
      return (
        <Block
          {...BLOCK_PROPS}
          overrides={{
            Block: {
              style: { ...ANIMATION_STYLES_DEVICE_MAP.MOBILE },
            },
          }}
        >
          {children}
        </Block>
      );
    }

    return <Block {...BLOCK_PROPS}>{children}</Block>;
  }
);

AnimationWrapper.displayName = 'AnimationWrapper';
