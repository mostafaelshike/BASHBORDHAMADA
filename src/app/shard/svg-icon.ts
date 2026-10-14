import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

const ICON_PATHS: Record<string, string[]> = {
  list: ['M4 6h16M4 12h16M4 18h16'],
  'bag-heart': [
    'M5 8h14l1 13H4L5 8Z',
    'M9 8V6a3 3 0 0 1 6 0v2',
    'M12 16s-3-1.8-3-3.7a1.8 1.8 0 0 1 3-1.2 1.8 1.8 0 0 1 3 1.2C15 14.2 12 16 12 16Z',
  ],
  search: ['M20 20l-4.5-4.5', 'M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z'],
  bell: ['M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  'exclamation-circle': ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 8v5', 'M12 16h.01'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'house-door': ['m3 10 9-7 9 7', 'M5 9v12h14V9', 'M10 21v-7h4v7'],
  'box-seam': ['m3 7 9-4 9 4-9 4-9-4Z', 'M3 7v10l9 4 9-4V7', 'M12 11v10', 'm7.5 5 9 4'],
  grid: ['M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'],
  'clipboard-check': ['M9 4h6l1 2h3v15H5V6h3l1-2Z', 'M9 4v4h6V4', 'm9 14 2 2 4-4'],
  people: ['M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M20 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  gear: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 2.94-.09-.02a1.7 1.7 0 0 0-1.78.72l-.05.08h-3.4l-.04-.08a1.7 1.7 0 0 0-1.79-.72l-.09.02-1.7-2.94.06-.06A1.7 1.7 0 0 0 9.6 15l-.08-.04v-3.4l.08-.04a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-2.94.09.02a1.7 1.7 0 0 0 1.78-.72l.05-.08h3.4l.04.08a1.7 1.7 0 0 0 1.79.72l.09-.02 1.7 2.94-.06.06A1.7 1.7 0 0 0 19.6 11l.08.04v3.4l-.08.04Z'],
  'box-arrow-right': ['M14 5h5v14h-5', 'M3 12h11', 'm10 8 4 4-4 4'],
  'arrow-repeat': ['M20 7h-5V2', 'M20 7a8 8 0 0 0-14-2L4 7', 'M4 17h5v5', 'M4 17a8 8 0 0 0 14 2l2-2'],
  'heart-pulse': ['M20.8 8.6c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z', 'M3.5 12h4l2-3 3.2 6 2-3h5.8'],
  capsule: ['M8 3a5 5 0 0 0-5 5v8a5 5 0 0 0 10 0V8a5 5 0 0 0-5-5Z', 'm4.5 16.5 7-7', 'M16 3a5 5 0 0 0-5 5v8a5 5 0 0 0 10 0V8a5 5 0 0 0-5-5Z', 'm12.5 16.5 7-7'],
  'person-wheelchair': ['M10 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'm9 7 3 1 2 5h4', 'M8 7l-2 7h6', 'M12 14l3 5h4', 'M8 15a5 5 0 1 0 5 5'],
  scissors: ['M6 6a2.5 2.5 0 1 0 0 .01Z', 'M6 18a2.5 2.5 0 1 0 0 .01Z', 'm8 7 12 12', 'm8 17 5-5', 'm15 9 5-5'],
  'shield-plus': ['M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z', 'M12 8v7', 'M8.5 11.5h7'],
  layers: ['m12 3 9 5-9 5-9-5 9-5Z', 'm3 12 9 5 9-5', 'm3 16 9 5 9-5'],
  boxes: ['M3 7h8v7H3zM13 7h8v7h-8zM8 16h8v5H8z', 'M7 7V4h10v3'],
  'file-medical': ['M6 3h8l4 4v14H6z', 'M14 3v5h4', 'M12 11v6', 'M9 14h6'],
  clipboard: ['M9 4h6l1 2h3v15H5V6h3l1-2Z', 'M9 4v4h6V4', 'M9 12h6M9 16h6'],
};

@Component({
  selector: 'app-svg-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round">
      <path *ngFor="let path of paths" [attr.d]="path"></path>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1em;
      height: 1em;
      flex: 0 0 auto;
      vertical-align: middle;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    :host(.spin) svg {
      animation: icon-spin 1s linear infinite;
    }

    @keyframes icon-spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class SvgIcon {
  @Input() name = '';

  get paths(): string[] {
    const iconName = this.name.trim().replace(/^bi-/, '').replace(/^bi\s+/, '');
    return ICON_PATHS[iconName] ?? ICON_PATHS['heart-pulse'];
  }
}