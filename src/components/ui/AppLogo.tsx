import React from 'react';
import { SvgXml } from 'react-native-svg';
import { LOGO_SVG } from '../../constants/logo-svg';

interface AppLogoProps {
  size?: number;
}

export const AppLogo = React.memo(function AppLogo({ size = 40 }: AppLogoProps) {
  return <SvgXml xml={LOGO_SVG} width={size} height={size} />;
});
