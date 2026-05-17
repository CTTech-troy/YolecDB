import { getSocketOrigin as getConfiguredSocketOrigin } from '@/config/domains';

export function getSocketOrigin(): string {
  return getConfiguredSocketOrigin();
}
