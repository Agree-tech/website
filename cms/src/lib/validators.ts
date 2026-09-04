import type { TextField, TextareaField } from 'payload'

/**
 * The build throws on a "<" in a content value — templates carry the markup,
 * content carries only text — so the editor refuses it at the point where a
 * person can still fix it, rather than at deploy time.
 *
 * ">" is deliberately allowed: platform.process legitimately reads "If amt > 100k".
 */
export const noMarkup: TextField['validate'] & TextareaField['validate'] = (value) => {
  if (typeof value === 'string' && value.includes('<')) {
    return 'Plain text only — the < character cannot be used here.'
  }
  return true
}
