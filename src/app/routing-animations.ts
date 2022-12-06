import { trigger, transition, style, query, animateChild, group, animate } from "@angular/animations";

export const routerTransition = trigger('routerTransition', [
    transition('HomePage => RoomPage', [
        query(':enter', [style({ opacity: 0 })], {
          optional: true,
        }),
        query(
          ':leave',
          [
            style({ opacity: 1 }),
            animate('0.2s', style({ opacity: 0 })),
          ],
          { optional: true }
        ),
        query(
          ':enter',
          [
            style({ opacity: 0 }),
            animate('0.2s', style({ opacity: 1 })),
          ],
          { optional: true }
        ),
      ]),
]);