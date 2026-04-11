import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../../theme';

export const PublishScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.icon}>🚀</Text>
    <Text style={styles.title}>发布中心</Text>
    <Text style={styles.subtitle}>即将上线，敬请期待！</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.snow },
  icon: { fontSize: 64, marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.dark },
  subtitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.gray, marginTop: Spacing.sm },
});
