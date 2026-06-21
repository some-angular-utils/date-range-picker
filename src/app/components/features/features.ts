import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-features',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './features.html',
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      title: 'Smart presets',
      description:
        'Today, tomorrow, last 3 days, current/next month, current/next year — one click away from the dropdown.',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      title: 'Dual-month calendar',
      description:
        'Switch to a custom range and pick start/end across two months side by side, with a live hover preview of the range.',
      icon: 'M4 6h16M4 12h16M4 18h16',
    },
    {
      title: 'Plain reactive forms',
      description:
        'Bind it to any AbstractControl via formControlItem — no module, no custom value accessor boilerplate to wire up.',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      title: 'Validators just work',
      description:
        'Attach Validators.required or any custom validator to the control like you would for any other form field.',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      title: 'Clear & reset built in',
      description:
        'A "Limpiar" action is available both from the presets dropdown and the calendar footer — no extra wiring needed.',
      icon: 'M6 18L18 6M6 6l12 12',
    },
    {
      title: 'Responsive by default',
      description:
        'The calendar collapses into a centered modal-style popover on mobile so it never overflows the viewport.',
      icon: 'M12 3v18M3 12h18',
    },
  ];
}
