import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, Renderer2, signal, WritableSignal } from '@angular/core';
import { DOCUMENT, DatePipe } from '@angular/common';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { SAUDateRangePickerModule } from '@some-angular-utils/date-range-picker';
import { CodeEditorComponent } from '../code-editor/code-editor';

type DemoId = 'basic' | 'prefilled' | 'compact' | 'validation' | 'theme';
type DemoKind = 'js' | 'css';

interface DemoConfig {
  label?: string;
  placeholder?: string;
  initialValue?: [string, string] | null;
  required?: boolean;
  css?: string;
}

interface DemoEntry {
  id: DemoId;
  label: string;
  description: string;
  kind: DemoKind;
  initialCode: string;
  code: WritableSignal<string>;
  error: WritableSignal<string | null>;
  control: FormControl<[Date, Date] | null>;
  selectedRange: WritableSignal<[Date, Date] | null>;
  canSubmit: WritableSignal<boolean>;
  config: WritableSignal<DemoConfig>;
}

function evalConfig(text: string): any {
  return new Function(`"use strict"; return (\n${text}\n);`)();
}

// date-range-input uses emulated encapsulation, so its own `.sau-date-range[_ngcontent-x]` rule has
// the same specificity as our override and can win on source order alone — !important forces ours to win.
function withImportant(declarations: string): string {
  return declarations.replace(/;\s*$/gm, ' !important;');
}

function dateRangeRequired(control: AbstractControl): ValidationErrors | null {
  const value = control.value as [Date, Date] | null;
  return value?.[0] && value?.[1] ? null : { required: true };
}

function applyJsConfig(demo: DemoEntry, cfg: DemoConfig): void {
  demo.control.setValidators(cfg.required ? [dateRangeRequired] : []);
  demo.control.setValue(cfg.initialValue ? [new Date(cfg.initialValue[0]), new Date(cfg.initialValue[1])] : null);
  demo.config.set(cfg);
}

function createDemo(id: DemoId, label: string, description: string, kind: DemoKind, initialCode: string): DemoEntry {
  const demo: DemoEntry = {
    id,
    label,
    description,
    kind,
    initialCode,
    code: signal(initialCode),
    error: signal<string | null>(null),
    control: new FormControl<[Date, Date] | null>(null),
    selectedRange: signal<[Date, Date] | null>(null),
    canSubmit: signal(false),
    config: signal<DemoConfig>(kind === 'css' ? { css: initialCode } : {}),
  };

  demo.control.valueChanges.subscribe(() => {
    demo.selectedRange.set(demo.control.value);
    demo.canSubmit.set(demo.control.valid);
  });

  if (kind === 'js') {
    applyJsConfig(demo, evalConfig(initialCode));
  }

  return demo;
}

const BASIC_CODE = `{
  label: 'Travel dates',
  placeholder: 'Select a date range',
}`;

const PREFILLED_CODE = `{
  label: 'Booking period',
  placeholder: 'Select a date range',
  initialValue: ['2026-07-01', '2026-07-10'],
}`;

const COMPACT_CODE = `{
  label: '',
  placeholder: 'Any date',
}`;

const VALIDATION_CODE = `{
  label: 'Stay dates',
  placeholder: 'Required — pick both dates',
  required: true,
}`;

const THEME_CODE = `--sau-color-primary: rgb(35, 163, 31);
--sau-color-background: rgb(255, 255, 255);`;

@Component({
  selector: 'app-demos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SAUDateRangePickerModule, CodeEditorComponent, DatePipe],
  templateUrl: './demos.html',
})
export class DemosComponent implements OnDestroy {
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private themeStyleEl = this.renderer.createElement('style') as HTMLStyleElement;

  activeTab = signal<DemoId>('basic');

  demos: DemoEntry[] = [
    createDemo('basic', 'Basic usage', 'A date-range-input bound to a plain FormControl — no wrapper config needed.', 'js', BASIC_CODE),
    createDemo('prefilled', 'Pre-filled range', 'Pass an existing [start, end] pair and the calendar opens already positioned on it.', 'js', PREFILLED_CODE),
    createDemo('compact', 'No label', 'Leave label empty to drop it into a toolbar or compact filter bar.', 'js', COMPACT_CODE),
    createDemo('validation', 'Required validation', 'Combine it with a standard validator — the Continue button stays disabled until both dates are picked.', 'js', VALIDATION_CODE),
    createDemo('theme', 'Theming', 'Every color is a CSS custom property. Edit the values below and watch it restyle instantly.', 'css', THEME_CODE),
  ];

  constructor() {
    this.renderer.appendChild(this.document.head, this.themeStyleEl);

    for (const demo of this.demos) {
      let timer: ReturnType<typeof setTimeout> | undefined;

      effect(() => {
        const text = demo.code();

        if (demo.kind === 'css') {
          demo.config.set({ css: text });
          demo.error.set(null);
          this.renderer.setProperty(this.themeStyleEl, 'textContent', `.theme-live .sau-date-range { ${withImportant(text)} }`);
          return;
        }

        clearTimeout(timer);
        timer = setTimeout(() => {
          try {
            applyJsConfig(demo, evalConfig(text));
            demo.error.set(null);
          } catch (err) {
            demo.error.set(err instanceof Error ? err.message : 'Invalid code');
          }
        }, 600);
      });
    }
  }

  ngOnDestroy(): void {
    this.renderer.removeChild(this.document.head, this.themeStyleEl);
  }

  selectTab(id: DemoId) {
    this.activeTab.set(id);
  }
}
