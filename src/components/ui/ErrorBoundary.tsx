// PulseSense — Error Boundary Component
// Catches rendering errors and shows a fallback UI with retry

import React, { Component, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as staticColors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fonts } from '../../constants/typography';

interface Props {
  children: React.ReactNode;
  title?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  colors?: any;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const c = this.props.colors || staticColors;
    if (this.state.hasError) {
      return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
          <View style={[styles.iconContainer, { backgroundColor: c.dangerSurface }]}>
            <Ionicons
              name={this.props.iconName || 'alert-circle-outline'}
              size={48}
              color={c.danger}
            />
          </View>
          <Text style={[styles.title, { color: c.textPrimary }]}>
            {this.props.title || 'Something went wrong'}
          </Text>
          <Text style={[styles.message, { color: c.textSecondary }]}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: c.primary }]} onPress={this.handleRetry} activeOpacity={0.7} accessibilityLabel="Retry loading the screen">
            <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: spacing.space2 }} />
            <Text style={styles.retryText}>Tap to Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.space6,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.display,
    marginBottom: spacing.space3,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    fontFamily: fonts.body,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.space6,
    paddingHorizontal: spacing.space4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.space3,
    paddingHorizontal: spacing.space6,
    borderRadius: borderRadius.md,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fonts.body,
  },
});
