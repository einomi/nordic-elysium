/**
 * @template T
 * @param {(...args: any[]) => T} func
 * @param {number} wait
 * @param {boolean} immediate
 * @returns {(...args: any[]) => void}
 */
export function debounce(func, wait, immediate = false) {
  /**
   * @type {ReturnType<typeof setTimeout> | undefined}
   */
  let timeout;

  /**
   * @this {unknown}
   * @param {...any[]} args
   * @returns {void}
   */
  // @ts-ignore
  return function (...args) {
    // eslint-disable-next-line consistent-this
    const context = this;
    /**
     * @returns {void}
     */
    const later = () => {
      timeout = undefined;
      if (!immediate) {
        // @ts-ignore
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      // @ts-ignore
      func.apply(context, args);
    }
  };
}
