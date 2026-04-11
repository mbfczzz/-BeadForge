import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../../theme';

export const PublishScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.icon}>📤</Text>
    <Text style={styles.text}>发布功能开发中...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.grayBg },
  icon: { fontSize: 48, marginBottom: 12 },
  text: { fontSize: FontSize.lg, color: Colors.gray },
});
