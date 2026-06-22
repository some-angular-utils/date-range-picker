import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-installation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './installation.html',
})
export class InstallationComponent {
  installSnippet = `npm install @some-angular-utils/date-range-picker`;

  importSnippet = `import { SAUDateRangePickerModule} from '@some-angular-utils/date-range-picker';

@Component({
  imports: [DateRangeInputComponent],
  // ...
})`;

  usageSnippet = `public dateRange = new FormControl<[Date, Date] | null>(null);

constructor() {
  this.dateRange.valueChanges.subscribe((range) => {
    // range -> [Date, Date] | null
  });
}`;

  templateSnippet = `<date-range-input
  label="Travel dates"
  placeholder="Select a date range"
  [dateRangeOptions]="dateRangeOptions"
  [formControlItem]="dateRange">
</date-range-input>`;
}
