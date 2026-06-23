# @some-angular-utils/date-range-picker

[![github stars](https://img.shields.io/github/stars/some-angular-utils/date-range-picker.svg?style=social&label=Star)](https://github.com/some-angular-utils/date-range-picker)

[![NPM Version](https://img.shields.io/npm/v/@some-angular-utils/date-range-picker)](https://www.npmjs.com/package/@some-angular-utils/date-range-picker)
[![NPM Downloads](https://img.shields.io/npm/dm/@some-angular-utils/date-range-picker)](https://www.npmjs.com/package/@some-angular-utils/date-range-picker)

[![npm bundle size](https://img.shields.io/bundlephobia/min/@some-angular-utils/date-range-picker)](https://www.npmjs.com/package/@some-angular-utils/date-range-picker)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@some-angular-utils/date-range-picker)](https://www.npmjs.com/package/@some-angular-utils/date-range-picker)

---

[NPM](https://www.npmjs.com/package/@some-angular-utils/date-range-picker)

---

## DEMO

This repo ships with an interactive showcase app — every usage pattern has a live, editable example (edit the code, the picker updates in real time). Run it locally:

```bash
npm install
npm run dev
```

Then open http://localhost:4200.

## IMPORT
```ts
import { SAUDateRangePickerModule} from '@some-angular-utils/date-range-picker';

@Component({
    imports: [DateRangeInputComponent],
    // ...
})
```

## TYPESCRIPT
```ts
public dateRange = new FormControl<[Date, Date] | null>(null);

constructor() {
    this.dateRange.valueChanges.subscribe((range) => {
        // range -> [Date, Date] | null
    });
}
```

## HTML
```html
<sau-date-range-picker
    label="Travel dates"
    placeholder="Select a date range"
    [formControlItem]="dateRange">
</sau-date-range-picker>
```

## INPUTS

`label` (optional label rendered above the field) · `placeholder` (shown when no range is selected) · `formControlItem` (any `AbstractControl` — works with `Validators.required` and custom validators like any other reactive form field)

## PRESETS

The dropdown ships with built-in presets: Hoy, Mañana, Hace 3 días, Mes actual, Próximo mes, Año actual, Próximo año — plus a "Rango personalizado..." option that opens a dual-month calendar.

## COLORS

```css
.sau-date-range {
    --sau-color-primary: rgb(147, 51, 234);
    --sau-color-background: rgb(255, 255, 255);
}
```
