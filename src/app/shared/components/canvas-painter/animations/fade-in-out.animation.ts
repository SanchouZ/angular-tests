import {
  animate,
  animation,
  style,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations';

const fade = animation([
  style({ opacity: '{{ from }}' }),
  animate('{{ time }} ease-in-out', style({ opacity: '{{ to }}' })),
]);

export const fadeInOutAnimationCustom = (
  time: string = '0.28s',
  enterOpacity: number = 0,
  leaveOpacity: number = 1,
  triggerName: string = 'fadeInOut'
) =>
  trigger(triggerName, [
    transition(':enter', [
      useAnimation(fade, {
        params: { time, from: enterOpacity, to: leaveOpacity },
      }),
    ]),
    transition(':leave', [
      useAnimation(fade, {
        params: { time, from: leaveOpacity, to: enterOpacity },
      }),
    ]),
  ]);

export const fadeInOutAnimation = trigger('fadeInOut', [
  transition(':enter', [
    useAnimation(fade, {
      params: { time: '0.28s', from: 0, to: 1 },
    }),
  ]),
  transition(':leave', [
    useAnimation(fade, {
      params: { time: '0.28s', from: 1, to: 0 },
    }),
  ]),
]);
