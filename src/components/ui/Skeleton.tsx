import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '' 
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton height="80px" borderRadius="8px" />
      <div className="skeleton-card-content">
        <Skeleton width="60%" height="24px" />
        <Skeleton width="40%" height="16px" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        <Skeleton width="20%" height="20px" />
        <Skeleton width="30%" height="20px" />
        <Skeleton width="15%" height="20px" />
        <Skeleton width="15%" height="20px" />
        <Skeleton width="20%" height="20px" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton-table-row">
          <Skeleton width="20%" height="16px" />
          <Skeleton width="30%" height="16px" />
          <Skeleton width="15%" height="16px" />
          <Skeleton width="15%" height="16px" />
          <Skeleton width="20%" height="16px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="skeleton-stats">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="skeleton-stat-card">
          <Skeleton width="40px" height="40px" borderRadius="50%" />
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height="16px" />
            <Skeleton width="40%" height="24px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="skeleton-chart">
      <Skeleton width="30%" height="24px" />
      <div className="skeleton-chart-content">
        <Skeleton height="200px" borderRadius="8px" />
      </div>
    </div>
  );
}
