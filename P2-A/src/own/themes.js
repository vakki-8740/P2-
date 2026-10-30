// Theme registry — add a theme here + one [data-theme] block in tokens.css
export const THEMES = [
  { id: 'light', label: 'Light', swatch: ['#f4f5f7', '#4f6bed'], group: 'light' },
  { id: 'dark', label: 'Dark', swatch: ['#12141a', '#7b92ff'], group: 'dark' },
  { id: 'blue', label: 'Blue', swatch: ['#f2f6ff', '#1d6fe0'], group: 'light' },
  { id: 'sky', label: 'Sky Blue', swatch: ['#f0f9ff', '#0284c7'], group: 'light' },
  { id: 'green', label: 'Green', swatch: ['#f1faf4', '#16a34a'], group: 'light' },
  { id: 'purple', label: 'Purple', swatch: ['#f7f4ff', '#7c3aed'], group: 'light' },
  { id: 'pink', label: 'Pink', swatch: ['#fff3f8', '#db2777'], group: 'light' },
  { id: 'orange', label: 'Orange', swatch: ['#fff7ef', '#ea580c'], group: 'light' },
  { id: 'red', label: 'Red', swatch: ['#fff3f3', '#dc2626'], group: 'light' },
  { id: 'teal', label: 'Teal', swatch: ['#effaf8', '#0d9488'], group: 'light' },
  { id: 'black', label: 'Black', swatch: ['#000000', '#f5f5f5'], group: 'dark' },
  { id: 'white', label: 'White', swatch: ['#ffffff', '#111111'], group: 'light' },
]

export const DEFAULT_THEME = 'light'
