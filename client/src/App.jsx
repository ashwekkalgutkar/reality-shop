import React from 'react';
import { useAnalytics } from './hooks/useAnalytics';
import { Header } from './components/Header/Header';
import { MetricsSummary } from './components/MetricsSummary/MetricsSummary';
import { AnalyticsTable } from './components/AnalyticsTable/AnalyticsTable';
import { Pagination } from './components/Pagination/Pagination';
import { TrafficSimulator } from './components/TrafficSimulator/TrafficSimulator';
import { AlertTriangle } from 'lucide-react';
import styles from './App.module.css';

export default function App() {
  const {
    data,
    page,
    limit,
    total,
    totalPages,
    summary,
    loading,
    isRefetching,
    isSimulating,
    lastSimulationEvent,
    error,
    changePage,
    changeLimit,
    simulateTraffic,
    refetch
  } = useAnalytics();

  return (
    <div className={styles.appContainer}>
      <Header onRefresh={refetch} isRefreshing={loading || isRefetching} />

      {error && (
        <div className={styles.errorBanner}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <TrafficSimulator
        onSimulate={simulateTraffic}
        isSimulating={isSimulating}
        lastEvent={lastSimulationEvent}
      />

      <MetricsSummary summary={summary} loading={loading} />

      <div className={styles.tableHeaderSection}>
        <div>
          <h2 className={styles.sectionTitle}>Video Performance Directory</h2>
          <span className={styles.sectionSubtitle}>
            Aggregated conversion rates and event telemetry by video
          </span>
        </div>
      </div>

      <AnalyticsTable data={data} loading={loading} isRefetching={isRefetching} />

      <Pagination
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={changePage}
        onLimitChange={changeLimit}
      />
    </div>
  );
}
