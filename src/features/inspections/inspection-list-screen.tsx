import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/data/store';
import { journalOrder, summarize, type AppRecord } from '@/domain/model';
import { formatRelative } from '@/lib/format';
import { createStyles, radius, space, useTheme } from '@/theme';
import {
  Button,
  CONTENT_MAX_WIDTH,
  EmptyState,
  HeaderButton,
  Icon,
  ProgressBar,
  Row,
  Separator,
  Text,
} from '@/ui';

export function InspectionListScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { records } = useStore();
  const ordered = useMemo(() => journalOrder(records), [records]);
  const current = ordered[0]?.status === 'draft' ? ordered[0] : undefined;
  const history = current ? ordered.slice(1) : ordered;

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <HeaderActions /> }} />
      <FlatList
        data={history}
        keyExtractor={(record) => record.id}
        contentInsetAdjustmentBehavior="automatic"
        style={styles.list}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + space.xxl },
        ]}
        ListHeaderComponent={
          records.length ? (
            <View style={styles.header}>
              {current && <ContinueCard record={current} />}
              {history.length > 0 && (
                <Text
                  variant="eyebrow"
                  tone="muted"
                  caps
                  accessibilityRole="header"
                  style={styles.sectionTitle}
                >
                  History
                </Text>
              )}
            </View>
          ) : null
        }
        renderItem={({ item }) => <InspectionRow record={item} />}
        ItemSeparatorComponent={RowSeparator}
        ListEmptyComponent={records.length ? null : <EmptyJournal />}
      />
    </>
  );
}

function open(record: AppRecord) {
  router.push({ pathname: '/inspection/[id]', params: { id: record.id } });
}

function HeaderActions() {
  const styles = useStyles();
  return (
    <View style={styles.headerActions}>
      <HeaderButton
        icon="info"
        accessibilityLabel="About Field Inspections"
        onPress={() => router.push('/about')}
      />
      <HeaderButton
        icon="add"
        accessibilityLabel="New inspection"
        onPress={() => router.push('/new')}
      />
    </View>
  );
}

function RowSeparator() {
  return <Separator inset={space.gutter} />;
}

/** The one draft worth resuming, with progress in words and a thin track. */
function ContinueCard({ record }: { record: AppRecord }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const summary = summarize(record);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeading}>
        <Text variant="eyebrow" tone="accent" caps>
          Continue
        </Text>
        <Text variant="title" accessibilityRole="header">
          {record.site}
        </Text>
      </View>
      <View style={styles.cardProgress}>
        <View style={styles.cardStats}>
          <Text variant="label" tabular>
            {summary.recorded} of {summary.total} recorded
          </Text>
          {summary.findings > 0 && (
            <View style={styles.inline}>
              <Icon name="finding" size={14} color={colors.attention} />
              <Text variant="footnote" tone="attention" tabular>
                {summary.findings} need{summary.findings === 1 ? 's' : ''}{' '}
                attention
              </Text>
            </View>
          )}
        </View>
        <ProgressBar
          value={summary.recorded}
          total={summary.total}
          accessibilityLabel={`${record.site} progress`}
        />
        <Text variant="footnote" tone="muted">
          Last edited · {formatRelative(record.updatedAt)}
        </Text>
      </View>
      <Button
        label="Continue inspection"
        icon="next"
        onPress={() => open(record)}
      />
    </View>
  );
}

function InspectionRow({ record }: { record: AppRecord }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const summary = summarize(record);
  const completed = record.status === 'completed';
  const detail = completed
    ? `Completed ${formatRelative(record.completedAt!)}`
    : `Draft · ${summary.recorded} of ${summary.total} recorded`;
  const findings =
    summary.findings === 0
      ? 'No findings'
      : `${summary.findings} ${summary.findings === 1 ? 'finding' : 'findings'}`;
  return (
    <Row
      onPress={() => open(record)}
      navigates
      accessibilityLabel={`${record.site}. ${detail}. ${findings}.`}
    >
      <View style={styles.rowBody}>
        <Text variant="headline">{record.site}</Text>
        <View style={styles.inline}>
          <Icon
            name={completed ? 'completed' : 'checklist'}
            size={14}
            color={completed ? colors.accent : colors.muted}
          />
          <Text variant="footnote" tone="muted" tabular>
            {detail} · {findings}
          </Text>
        </View>
      </View>
    </Row>
  );
}

function EmptyJournal() {
  return (
    <EmptyState
      icon="checklist"
      title="No inspections yet"
      body="Start with a site name and work through eight checkpoints."
    >
      <Button
        label="New inspection"
        icon="add"
        onPress={() => router.push('/new')}
      />
    </EmptyState>
  );
}

const useStyles = createStyles(({ colors }) => ({
  list: { flex: 1, backgroundColor: colors.canvas },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  header: { paddingTop: space.sm, gap: space.xl },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  sectionTitle: {
    paddingHorizontal: space.gutter,
    paddingBottom: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  card: {
    marginHorizontal: space.gutter,
    padding: space.xl - 4,
    gap: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.rule,
    backgroundColor: colors.surface,
  },
  cardHeading: { gap: space.xs },
  cardProgress: { gap: space.sm },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  inline: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
  rowBody: { gap: space.xs },
}));
