import React from 'react';
export const SafeAreaProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => children as any;
export const SafeAreaView: React.FC<{ style?: any; children?: React.ReactNode }> = ({ children }) => children as any;
export const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
