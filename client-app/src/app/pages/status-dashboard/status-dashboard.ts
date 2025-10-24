import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PlantService } from '../../services/plant.service';
import { Observable } from 'rxjs';

export type StatusValue = 'pass' | 'warn' | 'fail';

// ---- Interface Definitions ---- //
export interface StatusCheck {
  name: string;
  status: StatusValue;
  description: string;
}

export interface StatusSection {
  title: string;
  items: StatusCheck[];
}

export interface HealthCheckConfig {
  sectionTitle: string;
  itemName: string;
  checkFn: () => Observable<any>;
  passThresholdMs?: number;  // Default 100ms
  warnThresholdMs?: number;  // Default 500ms
  updateResponseTimeItem?: string;  // Optional: also update another item with response time
}

// ---- Component Definition ---- //

@Component({
  selector: 'app-status-dashboard',
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './status-dashboard.html',
  styleUrl: './status-dashboard.scss',
})
export class StatusDashboard implements OnInit, OnDestroy {
  // ---- Private Properties ---- //
  private healthCheckInterval?: number;

  // ---- Lifecycle ---- //
  constructor(private plantService: PlantService) {}

  ngOnInit() {
    // Configure health checks
    const healthChecks: HealthCheckConfig[] = [
      {
        sectionTitle: 'API Health',
        itemName: 'Plants Endpoint',
        checkFn: () => this.plantService.getPlants(),
        passThresholdMs: 100,
        warnThresholdMs: 500,
        updateResponseTimeItem: 'API Response Time'
      },
      // Add more health checks here as needed
      // Example:
      // {
      //   sectionTitle: 'API Health',
      //   itemName: 'Health Check',
      //   checkFn: () => this.http.get('/api/health'),
      //   passThresholdMs: 50,
      //   warnThresholdMs: 200
      // }
    ];

    // Run all health checks immediately
    healthChecks.forEach(config => this.performHealthCheck(config));

    // Set up interval for periodic checks
    this.healthCheckInterval = window.setInterval(() => {
      healthChecks.forEach(config => this.performHealthCheck(config));
    }, 10000);
  }

  ngOnDestroy() {
    // Clean up interval when component is destroyed
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  // ---- Signals ---- //

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

  // ---- Public Methods ---- //

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

  // ---- Private Methods ---- //

  private performHealthCheck(config: HealthCheckConfig) {
    const startTime = Date.now();
    const passThreshold = config.passThresholdMs ?? 100;
    const warnThreshold = config.warnThresholdMs ?? 500;

    config.checkFn().subscribe({
      next: () => {
        const responseTime = Date.now() - startTime;

        // Update the main item status
        this.updateStatus(config.sectionTitle, config.itemName, {
          status: 'pass',
          description: `${config.itemName} (${responseTime}ms)`
        });

        // Optionally update response time item if specified
        if (config.updateResponseTimeItem) {
          let status: StatusValue;
          let description: string;

          if (responseTime < passThreshold) {
            status = 'pass';
            description = `Response time ${responseTime}ms`;
          } else if (responseTime < warnThreshold) {
            status = 'warn';
            description = `Response time ${responseTime}ms (slow)`;
          } else {
            status = 'fail';
            description = `Response time ${responseTime}ms (critical)`;
          }

          this.updateStatus(config.sectionTitle, config.updateResponseTimeItem, {
            status,
            description
          });
        }
      },
      error: (err) => {
        // Update main item to fail
        this.updateStatus(config.sectionTitle, config.itemName, {
          status: 'fail',
          description: `${config.itemName} failed: ${err.status || 'Network error'}`
        });

        // Also mark response time item as fail if specified
        if (config.updateResponseTimeItem) {
          this.updateStatus(config.sectionTitle, config.updateResponseTimeItem, {
            status: 'fail',
            description: 'Unable to measure - endpoint unreachable'
          });
        }
      }
    });
  }

  private updateStatus(sectionTitle: string, itemName: string, updates: Partial<StatusCheck>) {
    this.statusSections.update(sections => {
      return sections.map(section => {
        if (section.title === sectionTitle) {
          return {
            ...section,
            items: section.items.map(item => {
              if (item.name === itemName) {
                return { ...item, ...updates };
              }
              return item;
            })
          };
        }
        return section;
      });
    });
  }
}
