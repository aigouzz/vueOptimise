import { identity, resolveAsset } from '../../util/index'

/**
 * Runtime helper for resolving filters
 */
export function resolveFilter(id: string): Function {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}