/**
 * The build throws on a "<" in a content value — templates carry the markup,
 * content carries only text — so the editor refuses it at the point where a
 * person can still fix it, rather than at deploy time.
 *
 * ">" is deliberately allowed: platform.process legitimately reads "If amt > 100k".
 *
 * Typed by its parameter rather than as TextField['validate'] & TextareaField['validate'].
 * That intersection is two call signatures, so `value` gets no contextual type and the
 * result is assignable to neither field; a function that accepts anything is assignable
 * to both, and the generated globals use it on text and textarea alike.
 */
export const noMarkup = (value: unknown): string | true => {
  if (typeof value === 'string' && value.includes('<')) {
    return 'Plain text only — the < character cannot be used here.'
  }
  return true
}
