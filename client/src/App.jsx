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
  const [mousePos, setMousePos] = React.useState({ x: -500, y: -500 });
  const containerRef = React.useRef(null);
  const tableSectionRef = React.useRef(null);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

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

  const handlePageChange = (newPage) => {
    changePage(newPage);
    if (tableSectionRef.current) {
      tableSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLimitChange = (newLimit) => {
    changeLimit(newLimit);
    if (tableSectionRef.current) {
      tableSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={styles.appWrapper} 
      onMouseMove={handleMouseMove}
    >
      {/* Ambient background glow & mouse spotlight */}
      <div className={styles.ambientBackground}>
        <div className={styles.blobIndigo} />
        <div className={styles.blobPurple} />
      </div>

      <div 
        className={styles.mouseSpotlight} 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px` 
        }} 
      />

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

      <div ref={tableSectionRef} className={styles.tableHeaderSection}>
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
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
      </div>
    </div>
  );
}

