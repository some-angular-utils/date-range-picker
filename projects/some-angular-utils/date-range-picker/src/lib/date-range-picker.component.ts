import { Component, Input, Output, EventEmitter, signal, computed, effect, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

export interface DateRangeOption {
    label: string;
    value: string;
    getRange: () => [Date, Date];
}

@Component({
    selector: 'sau-date-range-picker',
    templateUrl: './date-range-picker.component.html',
    styleUrl: './date-range-picker.component.scss',
    imports: [CommonModule, ReactiveFormsModule]
})
export class SAUDateRangePickerModule {
    @Input() label = '';
    @Input() placeholder = 'Selecciona rango de fechas';

    private _formControlItem!: AbstractControl;

    @Input() set formControlItem(ctrl: AbstractControl) {
        this._formControlItem = ctrl;
        this.inputControl = ctrl as FormControl;
        if (this.inputControl && this.inputControl.value) {
            const currentVal = this.inputControl.value;
            if (Array.isArray(currentVal) && currentVal[0] && currentVal[1]) {
                this.startDate.set(new Date(currentVal[0]));
                this.endDate.set(new Date(currentVal[1]));
            }
        }
    }

    get formControlItem() { return this._formControlItem; }
    @Output() onClick = new EventEmitter<any>();
    inputControl!: FormControl;

    showDropdown = signal(false);
    showCalendar = signal(false);
    selectedMode = signal<'preset' | 'custom'>('preset');
    startDate = signal<Date | null>(null);
    endDate = signal<Date | null>(null);
    currentMonth = signal(new Date());
    selectingEndDate = signal(false);
    hoveredDate = signal<Date | null>(null);
    isEditingMainInput = signal(false);

    nextMonthComputed = computed(() => {
        const date = new Date(this.currentMonth());
        date.setMonth(date.getMonth() + 1);
        return date;
    });

    displayDate = computed(() => {
        const start = this.startDate();
        const end = this.endDate();
        if (!start || !end) return '';
        return `${this.formatDate(start)} - ${this.formatDate(end)}`;
    });

    constructor(private elementRef: ElementRef) {
        effect(() => {
            if (this.showCalendar()) {
                this.selectingEndDate.set(false);
            }
        });
    }

    @HostListener('document:click', ['$event'])
    clickOut(event: MouseEvent) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.showDropdown.set(false);
            this.showCalendar.set(false);
            this.hoveredDate.set(null);
        }
    }

    @Input() dateRangeOptions: DateRangeOption[] = [
        {
            label: 'Hoy',
            value: 'today',
            getRange: () => {
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const end = new Date(today); end.setHours(23, 59, 59, 999);
                return [today, end];
            }
        },
        {
            label: 'Ayer',
            value: 'yesterday',
            getRange: () => {
                const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0, 0, 0, 0);
                const end = new Date(yesterday); end.setHours(23, 59, 59, 999);
                return [yesterday, end];
            }
        },
        {
            label: 'Hace 3 días',
            value: 'last3days',
            getRange: () => {
                const end = new Date(); end.setHours(23, 59, 59, 999);
                const start = new Date(); start.setDate(start.getDate() - 3); start.setHours(0, 0, 0, 0);
                return [start, end];
            }
        },
        {
            label: 'Mes actual',
            value: 'currentMonth',
            getRange: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1); start.setHours(0, 0, 0, 0);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); end.setHours(23, 59, 59, 999);
                return [start, end];
            }
        },
        {
            label: 'Mes anterior',
            value: 'previousMonth',
            getRange: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1); start.setHours(0, 0, 0, 0);
                const end = new Date(now.getFullYear(), now.getMonth(), 0); end.setHours(23, 59, 59, 999);
                return [start, end];
            }
        },
        {
            label: 'Año actual',
            value: 'currentYear',
            getRange: () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), 0, 1); start.setHours(0, 0, 0, 0);
                const end = new Date(now.getFullYear(), 11, 31); end.setHours(23, 59, 59, 999);
                return [start, end];
            }
        },
        {
            label: 'Año anterior',
            value: 'previousYear',
            getRange: () => {
                const now = new Date();
                const start = new Date(now.getFullYear() - 1, 0, 1); start.setHours(0, 0, 0, 0);
                const end = new Date(now.getFullYear() - 1, 11, 31); end.setHours(23, 59, 59, 999);
                return [start, end];
            }
        }
    ];

    toggleDropdown(event: MouseEvent) {
        event.stopPropagation();
        if (this.showCalendar()) {
            this.showCalendar.set(false);
            this.showDropdown.set(false);
        } else {
            this.showDropdown.set(!this.showDropdown());
        }
    }

    selectPresetRange(option: DateRangeOption) {
        const [start, end] = option.getRange();
        this.startDate.set(start);
        this.endDate.set(end);
        this.updateFormControl([start, end]);
        this.showDropdown.set(false);
    }

    openCustomRange() {
        this.selectedMode.set('custom');
        this.showCalendar.set(true);
        this.showDropdown.set(false);
        if (!this.startDate()) {
            this.currentMonth.set(new Date());
        } else {
            this.currentMonth.set(new Date(this.startDate()!));
        }
        this.selectingEndDate.set(false);
        this.hoveredDate.set(null);
    }

    backToPresets() {
        this.showCalendar.set(false);
        this.showDropdown.set(true);
    }

    closeCalendar() { this.showCalendar.set(false); }

    applyCustomRange() {
        if (this.startDate() && this.endDate()) {
            this.updateFormControl([this.startDate()!, this.endDate()!]);
            this.showCalendar.set(false);
        }
    }

    selectDate(date: Date) {
        if (!this.selectingEndDate()) {
            this.startDate.set(new Date(date));
            this.endDate.set(null);
            this.selectingEndDate.set(true);
        } else {
            if (date < this.startDate()!) {
                const temp = this.startDate();
                this.startDate.set(new Date(date));
                this.endDate.set(temp);
            } else {
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                this.endDate.set(endOfDay);
            }
            this.selectingEndDate.set(false);
            this.hoveredDate.set(null);
        }
    }

    selectDateFromDay(day: number | null, contextMonth: Date) {
        if (!day) return;
        const date = new Date(contextMonth.getFullYear(), contextMonth.getMonth(), day);
        this.selectDate(date);
    }

    onDayMouseEnter(day: number | null, contextMonth: Date) {
        if (!day || !this.selectingEndDate() || !this.startDate()) return;
        const date = new Date(contextMonth.getFullYear(), contextMonth.getMonth(), day);
        this.hoveredDate.set(date);
    }

    onDaysMouseLeave() {
        this.hoveredDate.set(null);
    }

    isDateHovered(day: number | null, contextMonth: Date): boolean {
        if (!day) return false;
        const start = this.startDate();
        const hover = this.hoveredDate();
        if (!start || !hover || !this.selectingEndDate()) return false;

        const date = new Date(contextMonth.getFullYear(), contextMonth.getMonth(), day);

        if (hover < start) {
            return date >= hover && date <= start;
        }
        return date >= start && date <= hover;
    }

    previousMonth() {
        const newMonth = new Date(this.currentMonth());
        newMonth.setMonth(newMonth.getMonth() - 1);
        this.currentMonth.set(newMonth);
    }

    nextMonth() {
        const newMonth = new Date(this.currentMonth());
        newMonth.setMonth(newMonth.getMonth() + 1);
        this.currentMonth.set(newMonth);
    }

    getDaysInMonth(contextMonth: Date): (number | null)[] {
        const year = contextMonth.getFullYear();
        const month = contextMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let startDate = firstDay.getDay();
        startDate = startDate === 0 ? 6 : startDate - 1;

        const daysInMonth = lastDay.getDate();
        const days: (number | null)[] = [];

        for (let i = 0; i < startDate; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return days;
    }

    isDateSelected(day: number | null, contextMonth: Date): boolean {
        if (!day) return false;
        const date = new Date(contextMonth.getFullYear(), contextMonth.getMonth(), day);
        const start = this.startDate();
        const end = this.endDate();
        if (!start || !end) return false;
        return date >= start && date <= end;
    }

    isDateStart(day: number | null, contextMonth: Date): boolean {
        if (!day) return false;
        const start = this.startDate();
        if (!start) return false;
        const date = new Date(contextMonth.getFullYear(), contextMonth.getMonth(), day);
        return date.toDateString() === start.toDateString();
    }

    isDateEnd(day: number | null, contextMonth: Date): boolean {
        if (!day) return false;
        const end = this.endDate();
        if (!end) return false;
        const date = new Date(contextMonth.getFullYear(), contextMonth.getMonth(), day);
        return date.toDateString() === end.toDateString();
    }

    isToday(day: number | null, contextMonth: Date): boolean {
        if (!day) return false;
        const date = new Date(contextMonth.getFullYear(), contextMonth.getMonth(), day);
        return date.toDateString() === new Date().toDateString();
    }

    formatDate(date: Date): string {
        return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    }

    formatDateForInput(date: Date | null): string {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private parseDateInputValue(value: string): Date | null {
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) return null;
        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    onStartDateInputChange(event: Event) {
        const date = this.parseDateInputValue((event.target as HTMLInputElement).value);
        if (!date) {
            this.startDate.set(null);
            return;
        }
        date.setHours(0, 0, 0, 0);
        this.startDate.set(date);
        this.currentMonth.set(new Date(date));

        const end = this.endDate();
        if (end && end < date) {
            const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);
            this.endDate.set(endOfDay);
        }
    }

    onEndDateInputChange(event: Event) {
        const date = this.parseDateInputValue((event.target as HTMLInputElement).value);
        if (!date) {
            this.endDate.set(null);
            return;
        }
        date.setHours(23, 59, 59, 999);

        const start = this.startDate();
        if (start && date < start) {
            const newStart = new Date(date); newStart.setHours(0, 0, 0, 0);
            this.startDate.set(newStart);
        }
        this.endDate.set(date);
    }

    private parseDisplayDateRange(value: string): [Date, Date] | null {
        const parts = value.split('-').map(part => part.trim());
        if (parts.length !== 2) return null;

        const start = this.parseDDMMYYYY(parts[0]);
        const end = this.parseDDMMYYYY(parts[1]);
        if (!start || !end) return null;

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        if (end < start) return null;
        return [start, end];
    }

    private parseDDMMYYYY(value: string): Date | null {
        const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (!match) return null;

        const day = Number(match[1]);
        const month = Number(match[2]);
        const year = Number(match[3]);
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
        return date;
    }

    onDisplayInputChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = input.value.trim();

        if (!value) {
            this.clearSelection();
            return;
        }

        const range = this.parseDisplayDateRange(value);
        if (!range) {
            input.value = this.displayDate();
            return;
        }

        this.startDate.set(range[0]);
        this.endDate.set(range[1]);
        this.updateFormControl(range);
    }

    onDisplayInputKeydown(event: Event) {
        (event.target as HTMLInputElement).blur();
    }

    onDisplayInputClick(event: MouseEvent) {
        if (this.isEditingMainInput()) {
            event.stopPropagation();
        }
    }

    onDisplayInputDblClick(event: MouseEvent) {
        event.stopPropagation();
        this.isEditingMainInput.set(true);
        const input = event.target as HTMLInputElement;
        queueMicrotask(() => { input.focus(); input.select(); });
    }

    onDisplayInputBlur() {
        this.isEditingMainInput.set(false);
    }

    getMonthYear(contextMonth: Date): string {
        return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(contextMonth);
    }

    getWeekDays(): string[] {
        return ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    }

    private updateFormControl(dates: [Date, Date]) {
        if (this.inputControl) {
            this.inputControl.setValue(dates, { emitEvent: true });
        }
    }

    clearSelectionFromPresets() {
        this.startDate.set(null);
        this.endDate.set(null);
        this.selectingEndDate.set(false);
        this.hoveredDate.set(null);
        this.updateFormControl([null, null] as any);
        this.showDropdown.set(false);
    }

    clearSelection() {
        this.startDate.set(null);
        this.endDate.set(null);
        this.selectingEndDate.set(false);
        this.hoveredDate.set(null);
        this.updateFormControl([null, null] as any);
        this.showCalendar.set(false);
    }
}