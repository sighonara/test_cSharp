import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export type StatusValue = 'pass' | 'warn' | 'fail';

export interface StatusCheck {
  name: string;
  status: StatusValue;
  description: string;
}

export interface StatusSection {
  title: string;
  items: StatusCheck[];
}

@Component({
  selector: 'app-status-dashboard',
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './status-dashboard.html',
  styleUrl: './status-dashboard.scss',
})
export class StatusDashboard {
  statusSections = signal<StatusSection[]>([
    {
      title: 'Test Values (Static)',
      items: [
        { name: 'Dummy Pass', status: 'pass', description: 'Always passes' },
        { name: 'Dummy Warn', status: 'warn', description: 'Always warns' },
        { name: 'Dummy Fail', status: 'fail', description: 'Always fails' },
      ]
    },
    {
      title: 'API Health',
      items: [
        // TODO: Implement actual health check by calling GET /api/health endpoint
        // pass: 200 response, warn: 200-500ms response time, fail: timeout/error
        { name: 'C# API Server', status: 'pass', description: 'Main backend server health' },

        // TODO: Test GET /api/plants with actual HTTP call
        // pass: 200 response, warn: 200 with slow response, fail: 4xx/5xx
        { name: 'Plants Endpoint', status: 'pass', description: 'GET /api/plants' },

        // TODO: Test POST/PUT/DELETE operations
        // pass: all succeed, warn: one fails, fail: multiple fail
        { name: 'Plant CRUD', status: 'pass', description: 'POST/PUT/DELETE operations' },

        // TODO: Implement dedicated health endpoint
        { name: 'Health Check', status: 'pass', description: 'GET /api/health' },

        // TODO: Measure average response time over last N requests
        // pass: <100ms, warn: 100-500ms, fail: >500ms
        { name: 'API Response Time', status: 'warn', description: 'Average response >200ms' },

        // TODO: Check rate limit headers from API responses
        // pass: <50% used, warn: 50-80%, fail: >80%
        { name: 'API Rate Limiting', status: 'pass', description: 'Request rate within limits' },

        // TODO: Test CORS by checking response headers
        // pass: headers present, warn: partial headers, fail: missing/incorrect
        { name: 'CORS Configuration', status: 'pass', description: 'CORS headers valid' },
      ]
    },
    {
      title: 'Database',
      items: [
        // TODO: Query connection pool stats from API
        // pass: active < max/2, warn: active > max/2, fail: pool exhausted
        { name: 'DB Connection Pool', status: 'pass', description: 'Connection pool healthy' },

        // TODO: Track query execution times
        // pass: avg <50ms, warn: 50-200ms, fail: >200ms
        { name: 'DB Query Performance', status: 'pass', description: 'Queries <100ms avg' },

        // TODO: Run periodic integrity check query
        // pass: no issues, warn: minor issues, fail: critical issues
        { name: 'Data Integrity', status: 'pass', description: 'No orphaned records' },

        // TODO: Check for constraint violations
        // pass: none, warn: 1-5, fail: >5
        { name: 'Unique Constraints', status: 'pass', description: 'Plant names unique' },

        // TODO: Query database size metrics
        // pass: <70% full, warn: 70-90%, fail: >90%
        { name: 'DB Storage', status: 'warn', description: 'Storage at 75%' },
      ]
    },
    {
      title: 'System Resources',
      items: [
        // TODO: Get memory stats from server (Process.GetCurrentProcess().WorkingSet64)
        // pass: <70%, warn: 70-90%, fail: >90%
        { name: 'Memory Usage', status: 'pass', description: 'Memory at 45%' },

        // TODO: Get CPU usage from server (PerformanceCounter or Process.TotalProcessorTime)
        // pass: <60%, warn: 60-85%, fail: >85%
        { name: 'CPU Usage', status: 'pass', description: 'CPU at 30%' },

        // TODO: Monitor disk I/O operations per second
        // pass: <1000/s, warn: 1000-5000/s, fail: >5000/s
        { name: 'Disk I/O', status: 'pass', description: 'I/O operations normal' },
      ]
    },
    {
      title: 'External Services',
      items: [
        // TODO: Ping auth provider endpoint
        { name: 'Authentication Service', status: 'pass', description: 'Auth provider online' },
        { name: 'Email Service', status: 'pass', description: 'SMTP server reachable' },
        { name: 'Logging Service', status: 'pass', description: 'Log aggregation active' },
        { name: 'CDN Availability', status: 'pass', description: 'Content delivery normal' },
        { name: 'Cache Service', status: 'pass', description: 'Redis cache operational' },
        { name: 'File Storage', status: 'pass', description: 'S3/blob storage accessible' },

        // TODO: Call weather API with test request, check response time
        // pass: <2s, warn: 2-5s, fail: >5s or error
        { name: 'Weather API', status: 'warn', description: 'Intermittent timeouts' },

        { name: 'Geolocation API', status: 'pass', description: 'Location services active' },
        { name: 'Analytics Service', status: 'pass', description: 'Analytics tracking ok' },
        { name: 'Backup Service', status: 'pass', description: 'Last backup successful' },

        // TODO: Check SSL cert expiration date
        // pass: >30 days, warn: 7-30 days, fail: <7 days
        { name: 'SSL Certificate', status: 'pass', description: 'Valid for 90 days' },

        { name: 'DNS Resolution', status: 'pass', description: 'DNS queries resolving' },
        { name: 'Load Balancer', status: 'pass', description: 'All nodes healthy' },
        { name: 'Firewall Rules', status: 'pass', description: 'Security rules active' },
        { name: 'Monitoring Service', status: 'pass', description: 'Metrics collection ok' },
        { name: 'Notification Service', status: 'pass', description: 'Push notifications ok' },

        // TODO: Check last index update timestamp
        // pass: <1hr old, warn: 1-24hr, fail: >24hr
        { name: 'Search Index', status: 'warn', description: 'Index rebuild pending' },

        { name: 'Session Store', status: 'pass', description: 'User sessions valid' },
        { name: 'API Gateway', status: 'pass', description: 'Gateway routing ok' }
      ]
    }
  ]);

  getStatusIcon(status: StatusValue): string {
    switch (status) {
      case 'pass': return 'check_circle';
      case 'warn': return 'warning';
      case 'fail': return 'error';
    }
  }

  getStatusClass(status: StatusValue): string {
    return `status-${status}`;
  }
}
