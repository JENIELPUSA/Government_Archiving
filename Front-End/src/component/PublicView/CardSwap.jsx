import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import gsap from 'gsap';

// ----------------- Card Component -----------------
export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute top-1/2 left-1/2 rounded-xl border border-white bg-black 
      [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] 
      ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
  />
));
Card.displayName = 'Card';

// ----------------- Helper Functions -----------------
const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap = ({
  width = 500,
  height = 500,
  cardDistance = 5,
  verticalDistance = 50,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 10,
  easing = 'elastic',
  children
}) => {
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(() => childArr.map(() => React.createRef()), [childArr.length]);
  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef(null);
  const intervalRef = useRef();
  const container = useRef(null);

  // Responsive cardDistance (nag-aadjust habang lumiit ang screen)
  const [responsiveDistance, setResponsiveDistance] = useState(cardDistance);
  // Responsive size for cards (dynamic scaling)
  const [responsiveSize, setResponsiveSize] = useState({ w: width, h: height });

  useEffect(() => {
    const updateResponsive = () => {
      const screenW = window.innerWidth;

      // dynamic scale (base: 1920px screen, min: 50% size, max: 100%)
      const scale = Math.min(Math.max(screenW / 2000, 0.3), 1);

      setResponsiveDistance(cardDistance * scale);
      setResponsiveSize({
        w: width * scale,
        h: height * scale
      });
    };

    updateResponsive();
    window.addEventListener('resize', updateResponsive);
    return () => window.removeEventListener('resize', updateResponsive);
  }, [cardDistance, width, height]);

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) =>
      placeNow(r.current, makeSlot(i, responsiveDistance, verticalDistance, total), skewAmount)
    );

    const swap = () => {
      if (order.current.length < 2) return;
      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, { y: '+=150', duration: config.durDrop, ease: config.ease });
      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);

      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i, responsiveDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 2, responsiveDistance, verticalDistance, refs.length);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, 'return');
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease
        },
        'return'
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    if (pauseOnHover && container.current) {
      const node = container.current;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        clearInterval(intervalRef.current);
      };
    }

    return () => clearInterval(intervalRef.current);
  }, [verticalDistance, delay, pauseOnHover, skewAmount, easing, refs, responsiveDistance]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: {
            width: '100%',
            maxWidth: responsiveSize.w,
            height: responsiveSize.h,
            objectFit: 'cover', // para hindi ma-stretch yung image
            ...(child.props.style ?? {})
          },
          onClick: e => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          }
        })
      : child
  );

  return (
    <div
      ref={container}
      className="relative w-full flex justify-center items-center overflow-ellipsis"
      style={{ height: responsiveSize.h }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;
