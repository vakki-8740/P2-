/**
 * Artificial "submitting" delay for the complaint forms.
 *
 * Pehle ye 4000ms tha — save hone ke BAAD bhi user ko 4 second intezaar
 * karwana padta tha. Ab 600ms: button pe spinning state dikh jati hai,
 * par server ka jawab aate hi popup turant khul jata hai.
 */
export const SUBMIT_DELAY_MS = 600

export function submitDelay() {
  return new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY_MS))
}
