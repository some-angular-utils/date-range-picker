import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { DateRangeInputComponent } from '@some-angular-utils/date-range-picker';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DateRangeInputComponent, DatePipe],
  templateUrl: './hero.html',
})
export class HeroComponent {
  copied = signal(false);
  resultRange = signal<[Date, Date] | null>(null);

  dateRange = new FormControl<[Date, Date] | null>(null);

  constructor() {
    this.dateRange.valueChanges.subscribe((value) => this.resultRange.set(value));
  }

  copyInstall() {
    navigator.clipboard?.writeText('npm install @some-angular-utils/date-range-picker');
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
