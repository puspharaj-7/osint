import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getCases } from '../../services/caseService';
import type { Case } from '../../lib/types';
import Colors from '../../constants/Colors';
import { GlassPanel } from '../../components/GlassPanel';
import { StatusBadge } from '../../components/StatusBadge';
import { LinearGradient } from 'expo-linear-gradient';

export default function CasesScreen() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const data = await getCases();
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Case }) => (
    <GlassPanel style={styles.caseCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.caseNumber}>{item.case_number}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.caseTitle}>{item.title}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Feather name="calendar" size={12} color="#71717a" />
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <StatusBadge status={item.priority} />
      </View>
    </GlassPanel>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.1)', 'transparent']}
        style={styles.backgroundGradient}
      />
      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={cases}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <Feather name="folder-minus" size={48} color={Colors.dark.primary} />
              </View>
              <Text style={styles.emptyTitle}>Zero Intelligence Cases</Text>
              <Text style={styles.emptyText}>No matching investigations found in standard search.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  listContent: {
    padding: 16,
    paddingTop: 24,
  },
  caseCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caseNumber: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  caseTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    color: '#71717a',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    color: '#71717a',
    textAlign: 'center',
    maxWidth: '80%',
  },
});
