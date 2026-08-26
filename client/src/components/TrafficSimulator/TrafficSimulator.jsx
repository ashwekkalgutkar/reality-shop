import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, Loader2, Activity } from 'lucide-react';
import styles from './TrafficSimulator.module.css';

export function TrafficSimulator({ onSimulate, isSimulating, lastEvent }) {
  const [autoPilot, setAutoPilot] = useState(false);

  useEffect(() => {
    let intervalId = null;
    if (autoPilot) {
      intervalId = setInterval(() => {
        if (!isSimulating) {
          onSimulate();
        }
      }, 2500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoPilot, isSimulating, onSimulate]);

  const getEventBadge = (type) => {
    switch (type) {
      case 'view':
        return <span className={`${styles.eventBadge} ${styles.eventBadgeView}`}>VIEW</span>;
      case 'click':
        return <span className={`${styles.eventBadge} ${styles.eventBadgeClick}`}>CLICK</span>;
      case 'add_to_cart':
        return <span className={`${styles.eventBadge} ${styles.eventBadgeCart}`}>ADD TO CART</span>;
      default:
        return <span className={styles.eventBadge}>{type}</span>;
    }
  };

  return (
    <div className={styles.simulatorCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleGroup}>
          <div className={styles.titleIcon}>
            <Zap size={18} />
          </div>
          <div>
            <div className={styles.title}>Traffic Event Simulator</div>
            <div className={styles.subtitle}>
              Inject realistic user engagement events (Views 60% | Clicks 25% | Add to Carts 15%) into SQLite pipeline
            </div>
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button
            className={`${styles.autopilotBtn} ${autoPilot ? styles.autopilotActive : ''}`}
            onClick={() => setAutoPilot(!autoPilot)}
            title="Automatically emit traffic events every 2.5s"
          >
            {autoPilot ? <Pause size={14} /> : <Play size={14} />}
            <span>{autoPilot ? 'Auto-Pilot Running' : 'Auto-Pilot Mode'}</span>
          </button>

          <button
            className={styles.simulateBtn}
            onClick={onSimulate}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <Loader2 size={16} className="spinning" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Activity size={16} />
                <span>Simulate Traffic</span>
              </>
            )}
          </button>
        </div>
      </div>

      {lastEvent && (
        <div className={styles.eventToast}>
          {getEventBadge(lastEvent.eventType)}
          <span className={styles.eventDetails}>
            Emitted event on <strong>"{lastEvent.videoTitle}"</strong>
          </span>
          <span className={styles.eventTime}>
            {new Date(lastEvent.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
