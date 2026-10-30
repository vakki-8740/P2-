/**
 * "Submitting" delay for the complaint forms — ab 0ms (koi extra wait nahi).
 *
 * Pehle yahan 4000ms ka jaan-boojh ke lagaya gaya wait tha, isliye save hone
 * ke baad bhi user ko 4 second rukna padta tha. Ab server ka jawab aate hi
 * success popup turant khul jata hai.
 *
 * Agar kabhi thoda "processing" feel chahiye ho, sirf ye number badal do
 * (e.g. 300 = 0.3 second).
 */
export const SUBMIT_DELAY_MS = 0

export function submitDelay() {
  if (!(SUBMIT_DELAY_MS > 0)) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, SUBMIT_DELAY_MS))
}
