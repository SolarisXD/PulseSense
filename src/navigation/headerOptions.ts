import { fonts } from '../constants/typography';
import { spacing } from '../constants/spacing';

export function screenHeader(title: string, colors: Record<string, any>, isEmergency = false) {
  if (isEmergency) {
    return {
      headerShown: true as const,
      title,
      headerTintColor: '#FFFFFF',
      headerStyle: {
        backgroundColor: colors.danger,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTitleStyle: {
        fontFamily: fonts.display,
        fontSize: 18,
        fontWeight: '700' as const,
        color: '#FFFFFF',
      },
    };
  }

  return {
    headerShown: true as const,
    title,
    headerTintColor: colors.primary,
    headerStyle: {
      backgroundColor: colors.surface,
      shadowColor: 'transparent',
      elevation: 0,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderLight,
    },
    headerTitleStyle: {
      fontFamily: fonts.display,
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    headerTitleContainerStyle: {
      paddingHorizontal: spacing.space4,
    },
  };
}
