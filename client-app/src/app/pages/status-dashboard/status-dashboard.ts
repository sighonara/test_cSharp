import {Component, OnDestroy, OnInit, signal, inject, computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PlantService } from '../../services/plant.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum StatusValue {
  Pass = 'pass',
  Warn = 'warn',
  Fail = 'fail'
}

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
  passThresholdMs: number;
  warnThresholdMs: number;
  updateResponseTimeItem: string;
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
  private memoryCheckInterval?: number;
  private http = inject(HttpClient);
  private resizeListener?: () => void;
  public StatusValue = StatusValue; // Just here so the template can access the enum

  // ---- Lifecycle ---- //
  constructor(private plantService: PlantService) {}

  ngOnInit() {
    // Configure HTTP-based health checks
    const healthChecks: HealthCheckConfig[] = [
      {
        sectionTitle: 'API Health (C# Backend)',
        itemName: 'Plants Endpoint',
        checkFn: () => this.plantService.getPlants(),
        passThresholdMs: 100,
        warnThresholdMs: 500,
        updateResponseTimeItem: 'API Response Time'
      },
      {
        sectionTitle: 'External API Services',
        itemName: 'GitHub',
        checkFn: () => this.http.get('https://api.github.com/users/octocat'),
        passThresholdMs: 1000,
        warnThresholdMs: 3000,
        updateResponseTimeItem: 'GitHub Response'
      },
      {
        sectionTitle: 'External API Services',
        itemName: 'JSONPlaceholder API',
        checkFn: () => this.http.get('https://jsonplaceholder.typicode.com/posts/1'),
        passThresholdMs: 500,
        warnThresholdMs: 2000,
        updateResponseTimeItem: 'JSONPlaceholder Response'
      },
      {
        sectionTitle: 'External API Services',
        itemName: 'Poke',
        checkFn: () => this.http.get('https://pokeapi.co/api/v2/pokemon/ditto'),
        passThresholdMs: 500,
        warnThresholdMs: 2000,
        updateResponseTimeItem: 'Poke Response'
      }
    ];

    healthChecks.forEach(config => this.performHealthCheck(config));

    this.checkCORSHeaders();

    // Set up intervals for periodic HTTP checks
    this.healthCheckInterval = window.setInterval(() => {
      healthChecks.forEach(config => this.performHealthCheck(config));
      this.checkCORSHeaders();
    }, 10000); // TODO: (#39) Make this configurable

    this.checkBrowserCapabilities();
    this.checkSystemInfo();

    // Add slight delay to ensure all timing entries are finalized
    if (document.readyState === 'complete') {
      setTimeout(() => this.checkPerformanceMetrics(), 100); // TODO: (#39) Make this configurable
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.checkPerformanceMetrics(), 100); // TODO: (#39) Make this configurable
      });
    }

    this.updateMemoryUsage();
    this.memoryCheckInterval = window.setInterval(() => this.updateMemoryUsage(), 1000); // TODO: (#39) Make this configurable

    this.resizeListener = () => this.updateViewportSize();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }

    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  // ---- Signals/Watches ---- //

  passTotal = computed(() => {
    return "Total: " + this.statusSections().flatMap(section => section.items).filter(item => item.status === StatusValue.Pass).length;
  })

  warnTotal = computed(() => {
    return "Total: " + this.statusSections().flatMap(section => section.items).filter(item => item.status === StatusValue.Warn).length;
  })

  failTotal = computed(() => {
    return "Total: " + this.statusSections().flatMap(section => section.items).filter(item => item.status === StatusValue.Fail).length;
  })

  statusSections = signal<StatusSection[]>([
    {
      title: 'Test Values (Static)',
      items: [
        { name: 'Dummy Pass', status: StatusValue.Pass, description: 'Always passes' },
        { name: 'Dummy Warn', status: StatusValue.Warn, description: 'Always warns' },
        { name: 'Dummy Fail', status: StatusValue.Fail, description: 'Always fails' },
      ]
    },
    {
      title: 'API Health (C# Backend)',
      items: [
        { name: 'Plants Endpoint', status: StatusValue.Pass, description: 'GET /api/plants' },
        { name: 'API Response Time', status: StatusValue.Pass, description: 'Measuring...' },
        { name: 'CORS Headers', status: StatusValue.Pass, description: 'CORS configuration' },
      ]
    },
    {
      title: 'External API Services',
      items: [
        { name: 'GitHub', status: StatusValue.Pass, description: 'https://api.github.com/users/octocat' },
        { name: 'GitHub Response', status: StatusValue.Pass, description: 'Measuring...' },

        { name: 'JSONPlaceholder API', status: StatusValue.Pass, description: 'jsonplaceholder.typicode.com' },
        { name: 'JSONPlaceholder Response', status: StatusValue.Pass, description: 'Measuring...' },

        { name: 'Poke', status: StatusValue.Pass, description: 'https://pokeapi.co/api/v2/pokemon/ditto' },
        { name: 'Poke Response', status: StatusValue.Pass, description: 'Measuring...' },
      ]
    },
    {
      title: 'Browser Capabilities',
      items: [
        { name: 'LocalStorage', status: StatusValue.Pass, description: 'Storage available' },
        { name: 'SessionStorage', status: StatusValue.Pass, description: 'Storage available' },
        { name: 'Geolocation API', status: StatusValue.Pass, description: 'Browser support' },
        { name: 'WebGL Support', status: StatusValue.Pass, description: 'Graphics available' },
        { name: 'Service Workers', status: StatusValue.Pass, description: 'PWA support' },
        { name: 'IndexedDB', status: StatusValue.Pass, description: 'Database available' },
        { name: 'WebSockets', status: StatusValue.Pass, description: 'Real-time support' },
        { name: 'Notifications', status: StatusValue.Pass, description: 'Permission status' },
      ]
    },
    {
      title: 'Client System Info',
      items: [
        { name: 'Browser', status: StatusValue.Pass, description: 'Detecting...' },
        { name: 'Platform', status: StatusValue.Pass, description: 'Detecting...' },
        { name: 'Screen Resolution', status: StatusValue.Pass, description: 'Detecting...' },
        { name: 'Color Depth', status: StatusValue.Pass, description: 'Detecting...' },
        { name: 'Viewport Size', status: StatusValue.Pass, description: 'Detecting...' },
        { name: 'Device Memory', status: StatusValue.Pass, description: 'Detecting...' },
        { name: 'CPU Cores', status: StatusValue.Pass, description: 'Detecting...' },
        { name: 'Network Connection', status: StatusValue.Pass, description: 'Detecting...' },
        { name: 'Online Status', status: StatusValue.Pass, description: 'Detecting...' },
        { name: 'Touch Support', status: StatusValue.Pass, description: 'Detecting...' },
        { name: 'Language', status: StatusValue.Pass, description: 'Detecting...' },
        { name: 'Timezone', status: StatusValue.Pass, description: 'Detecting...' },
      ]
    },
    {
      title: 'Performance Metrics',
      items: [
        { name: 'DOM Load Time', status: StatusValue.Pass, description: 'Measuring...' },
        { name: 'Page Load Time', status: StatusValue.Pass, description: 'Measuring...' },
        { name: 'First Contentful Paint', status: StatusValue.Pass, description: 'Measuring...' },
        { name: 'Memory Usage', status: StatusValue.Pass, description: 'Measuring...' },
        { name: 'DOM Nodes', status: StatusValue.Pass, description: 'Measuring...' },
      ]
    }
  ]);

  // ---- Public Methods ---- //

  getStatusIcon(status: StatusValue): string {
    switch (status) {
      case StatusValue.Pass: return 'check_circle';
      case StatusValue.Warn: return 'warning';
      case StatusValue.Fail: return 'error';
    }
  }

  getStatusClass(status: StatusValue): string {
    return `status-${status}`;
  }

  // ---- Private Methods ---- //

  /* Generic health check function for HTTP requests
     This function performs a simple HTTP request and updates the status accordingly
     Pass/Warn/Fail thresholds can be configured per-check
     Also, the response time item will be updated with the response time */
  // TODO: (#2, #3?, #5?) Add support for WebSockets and other types of health checks (e.g., database connection, custom API)
  private performHealthCheck(config: HealthCheckConfig) {
    const startTime = Date.now();
    const passThreshold = config.passThresholdMs ?? 100;
    const warnThreshold = config.warnThresholdMs ?? 500;

    config.checkFn().subscribe({
      next: () => {
        const responseTime = Date.now() - startTime;

        this.updateStatus(config.sectionTitle, config.itemName, {
          status: StatusValue.Pass,
          description: `${config.itemName} (${responseTime}ms)`
        });

        if (config.updateResponseTimeItem) {
          let status: StatusValue;
          let description: string;

          if (responseTime < passThreshold) {
            status = StatusValue.Pass;
            description = `Response time ${responseTime}ms`;
          } else if (responseTime < warnThreshold) {
            status = StatusValue.Warn;
            description = `Response time ${responseTime}ms (slow)`;
          } else {
            status = StatusValue.Fail;
            description = `Response time ${responseTime}ms (critical)`;
          }

          this.updateStatus(config.sectionTitle, config.updateResponseTimeItem, {
            status,
            description
          });
        }
      },
      error: (err) => {
        this.updateStatus(config.sectionTitle, config.itemName, {
          status: StatusValue.Fail,
          description: `${config.itemName} failed: ${err.status || 'Network error'}`
        });

        this.updateStatus(config.sectionTitle, config.updateResponseTimeItem, {
          status: StatusValue.Fail,
          description: 'Unable to measure - endpoint unreachable'
        });
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

  private checkCORSHeaders() {
    // Note: We can't directly access CORS headers from JavaScript for security reasons,
    // but we can verify the request succeeds (which means CORS is configured correctly)
    this.plantService.getPlants().subscribe({
      next: () => {
        this.updateStatus('API Health (C# Backend)', 'CORS Headers', {
          status: StatusValue.Pass,
          description: 'CORS configured - requests succeed'
        });
      },
      error: (err) => {
        // CORS errors typically show as network errors. This is our proxy for what we really want.
        const isCorsError = err.status === 0;
        this.updateStatus('API Health (C# Backend)', 'CORS Headers', {
          status: isCorsError ? StatusValue.Fail : StatusValue.Warn,
          description: isCorsError ? 'CORS blocked - check server config' : `Error: ${err.status}`
        });
      }
    });
  }

  private checkBrowserCapabilities() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      this.updateStatus('Browser Capabilities', 'LocalStorage', {
        status: StatusValue.Pass,
        description: 'Available'
      });
    } catch (e) {
      this.updateStatus('Browser Capabilities', 'LocalStorage', {
        status: StatusValue.Fail,
        description: 'Not available'
      });
    }

    try {
      const test = '__test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      this.updateStatus('Browser Capabilities', 'SessionStorage', {
        status: StatusValue.Pass,
        description: 'Available'
      });
    } catch (e) {
      this.updateStatus('Browser Capabilities', 'SessionStorage', {
        status: StatusValue.Fail,
        description: 'Not available'
      });
    }

    this.updateStatus('Browser Capabilities', 'Geolocation API', {
      status: 'geolocation' in navigator ? StatusValue.Pass : StatusValue.Fail,
      description: 'geolocation' in navigator ? 'Supported' : 'Not supported'
    });

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    this.updateStatus('Browser Capabilities', 'WebGL Support', {
      status: gl ? StatusValue.Pass : StatusValue.Fail,
      description: gl ? 'Available' : 'Not available'
    });

    this.updateStatus('Browser Capabilities', 'Service Workers', {
      status: 'serviceWorker' in navigator ? StatusValue.Pass : StatusValue.Fail,
      description: 'serviceWorker' in navigator ? 'Supported' : 'Not supported'
    });

    this.updateStatus('Browser Capabilities', 'IndexedDB', {
      status: 'indexedDB' in window ? StatusValue.Pass : StatusValue.Fail,
      description: 'indexedDB' in window ? 'Available' : 'Not available'
    });

    this.updateStatus('Browser Capabilities', 'WebSockets', {
      status: 'WebSocket' in window ? StatusValue.Pass : StatusValue.Fail,
      description: 'WebSocket' in window ? 'Supported' : 'Not supported'
    });

    const notifStatus = 'Notification' in window ? Notification.permission : 'unsupported';
    this.updateStatus('Browser Capabilities', 'Notifications', {
      status: notifStatus === 'granted' ? StatusValue.Pass : notifStatus === 'denied' ? StatusValue.Warn : StatusValue.Fail,
      description: notifStatus === 'unsupported' ? 'Not supported' : `Permission: ${notifStatus}`
    });
  }

  private checkSystemInfo() {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    if (userAgent.includes('Firefox')) browserName = 'Firefox';
    else if (userAgent.includes('Chrome')) browserName = 'Chrome';
    else if (userAgent.includes('Safari')) browserName = 'Safari';
    else if (userAgent.includes('Edge')) browserName = 'Edge';
    this.updateStatus('Client System Info', 'Browser', {
      status: StatusValue.Pass,
      description: browserName
    });

    this.updateStatus('Client System Info', 'Platform', {
      status: StatusValue.Pass,
      description: navigator.platform
    });

    this.updateStatus('Client System Info', 'Screen Resolution', {
      status: StatusValue.Pass,
      description: `${screen.width}x${screen.height}`
    });

    this.updateStatus('Client System Info', 'Color Depth', {
      status: StatusValue.Pass,
      description: `${screen.colorDepth}-bit`
    });

    // Viewport Size is special since it will update based on browser resizing
    this.updateViewportSize();

    const memory = (navigator as any).deviceMemory;
    this.updateStatus('Client System Info', 'Device Memory', {
      status: memory ? StatusValue.Pass : StatusValue.Warn,
      description: memory ? `${memory} GB` : 'Not available'
    });

    this.updateStatus('Client System Info', 'CPU Cores', {
      status: StatusValue.Pass,
      description: `${navigator.hardwareConcurrency || 'Unknown'}`
    });

    const connection = (navigator as any).connection;
    this.updateStatus('Client System Info', 'Network Connection', {
      status: connection ? StatusValue.Pass : StatusValue.Warn,
      description: connection ? connection.effectiveType : 'Not available'
    });

    this.updateStatus('Client System Info', 'Online Status', {
      status: navigator.onLine ? StatusValue.Pass : StatusValue.Fail,
      description: navigator.onLine ? 'Online' : 'Offline'
    });

    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.updateStatus('Client System Info', 'Touch Support', {
      status: StatusValue.Pass,
      description: hasTouch ? 'Enabled' : 'Not detected'
    });

    this.updateStatus('Client System Info', 'Language', {
      status: StatusValue.Pass,
      description: navigator.language
    });

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.updateStatus('Client System Info', 'Timezone', {
      status: StatusValue.Pass,
      description: tz
    });
  }

  private updateViewportSize() {
    this.updateStatus('Client System Info', 'Viewport Size', {
      status: StatusValue.Pass,
      description: `${window.innerWidth}x${window.innerHeight}`
    });
  }

  private checkPerformanceMetrics() {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries && navEntries.length > 0) {
      const navTiming = navEntries[0];

      const domLoadTime = Math.round(navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart);
      if (domLoadTime >= 0) {
        this.updateStatus('Performance Metrics', 'DOM Load Time', {
          status: domLoadTime < 50 ? StatusValue.Pass : domLoadTime < 150 ? StatusValue.Warn : StatusValue.Fail,
          description: `${domLoadTime}ms`
        });
      } else {
        this.updateStatus('Performance Metrics', 'DOM Load Time', {
          status: StatusValue.Warn,
          description: 'Not available'
        });
      }

      const pageLoadTime = Math.round(navTiming.loadEventEnd - navTiming.fetchStart);
      if (pageLoadTime >= 0) {
        this.updateStatus('Performance Metrics', 'Page Load Time', {
          status: pageLoadTime < 2000 ? StatusValue.Pass : pageLoadTime < 5000 ? StatusValue.Warn : StatusValue.Fail,
          description: `${pageLoadTime}ms`
        });
      } else {
        this.updateStatus('Performance Metrics', 'Page Load Time', {
          status: StatusValue.Warn,
          description: 'Not available'
        });
      }
    }

    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      const fcpTime = Math.round(fcp.startTime);
      this.updateStatus('Performance Metrics', 'First Contentful Paint', {
        status: fcpTime < 1500 ? StatusValue.Pass : fcpTime < 3000 ? StatusValue.Warn : StatusValue.Fail,
        description: `${fcpTime}ms`
      });
    } else {
      this.updateStatus('Performance Metrics', 'First Contentful Paint', {
        status: StatusValue.Warn,
        description: 'Not available'
      });
    }

    const nodeCount = document.getElementsByTagName('*').length;
    this.updateStatus('Performance Metrics', 'DOM Nodes', {
      status: nodeCount < 1500 ? StatusValue.Pass : nodeCount < 3000 ? StatusValue.Warn : StatusValue.Fail,
      description: `${nodeCount} nodes`
    });
  }

  private updateMemoryUsage() {
    const memory = (performance as any).memory;
    if (memory) {
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
      const percentUsed = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

      this.updateStatus('Performance Metrics', 'Memory Usage', {
        status: percentUsed < 50 ? StatusValue.Pass : percentUsed < 80 ? StatusValue.Warn : StatusValue.Fail,
        description: `${usedMB}MB / ${limitMB}MB (${percentUsed.toFixed(1)}%)`
      });
    } else {
      this.updateStatus('Performance Metrics', 'Memory Usage', {
        status: StatusValue.Warn,
        description: 'Not available (Chrome only)'
      });
    }
  }
}
