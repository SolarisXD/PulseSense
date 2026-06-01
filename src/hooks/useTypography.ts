import { useSettingsStore, FONT_SCALE_MULTIPLIERS } from '../store/settingsStore';
import { getScaledTypography } from '../constants/typography';

export function useTypography() {
  const fontScale = useSettingsStore((s) => s.fontScale);
  const multiplier = FONT_SCALE_MULTIPLIERS[fontScale];
  return getScaledTypography(multiplier);
}
