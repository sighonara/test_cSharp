import {Component, OnDestroy, OnInit, signal, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PlantService } from '../../services/plant.service';
import { HttpClient } from '@angular/common/http';
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
  passThresholdMs: number;
  warnThresholdMs: number;
  updateResponseTimeItem: string;  // Optional: update another item with response time
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
  private http = inject(HttpClient);
  private resizeListener?: () => void;

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

    // Set up interval for periodic HTTP checks
    this.healthCheckInterval = window.setInterval(() => {
      healthChecks.forEach(config => this.performHealthCheck(config));
      this.checkCORSHeaders();
    }, 10000);

    this.checkBrowserCapabilities();
    this.checkSystemInfo();

    // Set up resize listener for dynamic viewport updates
    this.resizeListener = () => this.updateViewportSize();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Clean up resize listener
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  // ---- Signals/Watches ---- //

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
      title: 'API Health (C# Backend)',
      items: [
        { name: 'Plants Endpoint', status: 'pass', description: 'GET /api/plants' },
        { name: 'API Response Time', status: 'pass', description: 'Measuring...' },

        { name: 'CORS Headers', status: 'pass', description: 'CORS configuration' },
      ]
    },
    {
      title: 'External API Services',
      items: [
        { name: 'GitHub', status: 'pass', description: 'https://api.github.com/users/octocat' },
        { name: 'GitHub Response', status: 'pass', description: 'Measuring...' },

        { name: 'JSONPlaceholder API', status: 'pass', description: 'jsonplaceholder.typicode.com' },
        { name: 'JSONPlaceholder Response', status: 'pass', description: 'Measuring...' },

        { name: 'Poke', status: 'pass', description: 'https://pokeapi.co/api/v2/pokemon/ditto' },
        { name: 'Poke Response', status: 'pass', description: 'Measuring...' },
      ]
    },
    {
      title: 'Browser Capabilities',
      items: [
        { name: 'LocalStorage', status: 'pass', description: 'Storage available' },
        { name: 'SessionStorage', status: 'pass', description: 'Storage available' },
        { name: 'Geolocation API', status: 'pass', description: 'Browser support' },
        { name: 'WebGL Support', status: 'pass', description: 'Graphics available' },
        { name: 'Service Workers', status: 'pass', description: 'PWA support' },
        { name: 'IndexedDB', status: 'pass', description: 'Database available' },
        { name: 'WebSockets', status: 'pass', description: 'Real-time support' },
        { name: 'Notifications', status: 'pass', description: 'Permission status' },
      ]
    },
    {
      title: 'Client System Info',
      items: [
        { name: 'Browser', status: 'pass', description: 'Detecting...' },
        { name: 'Platform', status: 'pass', description: 'Detecting...' },
        { name: 'Screen Resolution', status: 'pass', description: 'Detecting...' },
        { name: 'Color Depth', status: 'pass', description: 'Detecting...' },
        { name: 'Viewport Size', status: 'pass', description: 'Detecting...' },
        { name: 'Device Memory', status: 'pass', description: 'Detecting...' },
        { name: 'CPU Cores', status: 'pass', description: 'Detecting...' },
        { name: 'Network Connection', status: 'pass', description: 'Detecting...' },
        { name: 'Online Status', status: 'pass', description: 'Detecting...' },
        { name: 'Touch Support', status: 'pass', description: 'Detecting...' },
        { name: 'Language', status: 'pass', description: 'Detecting...' },
        { name: 'Timezone', status: 'pass', description: 'Detecting...' },
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

  // Generic health check function for HTTP requests
  // This function performs a simple HTTP request and updates the status accordingly
  // Pass/Warn/Fail thresholds can be configured per-check
  // Also, the response time item can be updated with the response time
  // FUTURE: Add support for WebSockets and other types of health checks (e.g., database connection, custom API)
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
        this.updateStatus(config.sectionTitle, config.itemName, {
          status: 'fail',
          description: `${config.itemName} failed: ${err.status || 'Network error'}`
        });

        this.updateStatus(config.sectionTitle, config.updateResponseTimeItem, {
          status: 'fail',
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
    // Make a request to our API and inspect response headers
    // Note: We can't directly access CORS headers from JavaScript for security reasons,
    // but we can verify the request succeeds (which means CORS is configured correctly)
    this.plantService.getPlants().subscribe({
      next: () => {
        this.updateStatus('API Health (C# Backend)', 'CORS Headers', {
          status: 'pass',
          description: 'CORS configured - requests succeed'
        });
      },
      error: (err) => {
        // CORS errors typically show as network errors. This is our proxy for what we really want.
        const isCorsError = err.status === 0;
        this.updateStatus('API Health (C# Backend)', 'CORS Headers', {
          status: isCorsError ? 'fail' : 'warn',
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
        status: 'pass',
        description: 'Available'
      });
    } catch (e) {
      this.updateStatus('Browser Capabilities', 'LocalStorage', {
        status: 'fail',
        description: 'Not available'
      });
    }

    try {
      const test = '__test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      this.updateStatus('Browser Capabilities', 'SessionStorage', {
        status: 'pass',
        description: 'Available'
      });
    } catch (e) {
      this.updateStatus('Browser Capabilities', 'SessionStorage', {
        status: 'fail',
        description: 'Not available'
      });
    }

    this.updateStatus('Browser Capabilities', 'Geolocation API', {
      status: 'geolocation' in navigator ? 'pass' : 'fail',
      description: 'geolocation' in navigator ? 'Supported' : 'Not supported'
    });

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    this.updateStatus('Browser Capabilities', 'WebGL Support', {
      status: gl ? 'pass' : 'fail',
      description: gl ? 'Available' : 'Not available'
    });

    this.updateStatus('Browser Capabilities', 'Service Workers', {
      status: 'serviceWorker' in navigator ? 'pass' : 'fail',
      description: 'serviceWorker' in navigator ? 'Supported' : 'Not supported'
    });

    this.updateStatus('Browser Capabilities', 'IndexedDB', {
      status: 'indexedDB' in window ? 'pass' : 'fail',
      description: 'indexedDB' in window ? 'Available' : 'Not available'
    });

    this.updateStatus('Browser Capabilities', 'WebSockets', {
      status: 'WebSocket' in window ? 'pass' : 'fail',
      description: 'WebSocket' in window ? 'Supported' : 'Not supported'
    });

    const notifStatus = 'Notification' in window ? Notification.permission : 'unsupported';
    this.updateStatus('Browser Capabilities', 'Notifications', {
      status: notifStatus === 'granted' ? 'pass' : notifStatus === 'denied' ? 'warn' : 'fail',
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
      status: 'pass',
      description: browserName
    });

    this.updateStatus('Client System Info', 'Platform', {
      status: 'pass',
      description: navigator.platform
    });

    this.updateStatus('Client System Info', 'Screen Resolution', {
      status: 'pass',
      description: `${screen.width}x${screen.height}`
    });

    this.updateStatus('Client System Info', 'Color Depth', {
      status: 'pass',
      description: `${screen.colorDepth}-bit`
    });

    // Viewport Size (will be updated dynamically on resize)
    this.updateViewportSize();

    const memory = (navigator as any).deviceMemory;
    this.updateStatus('Client System Info', 'Device Memory', {
      status: memory ? 'pass' : 'warn',
      description: memory ? `${memory} GB` : 'Not available'
    });

    this.updateStatus('Client System Info', 'CPU Cores', {
      status: 'pass',
      description: `${navigator.hardwareConcurrency || 'Unknown'}`
    });

    const connection = (navigator as any).connection;
    this.updateStatus('Client System Info', 'Network Connection', {
      status: connection ? 'pass' : 'warn',
      description: connection ? connection.effectiveType : 'Not available'
    });

    this.updateStatus('Client System Info', 'Online Status', {
      status: navigator.onLine ? 'pass' : 'fail',
      description: navigator.onLine ? 'Online' : 'Offline'
    });

    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.updateStatus('Client System Info', 'Touch Support', {
      status: 'pass',
      description: hasTouch ? 'Enabled' : 'Not detected'
    });

    this.updateStatus('Client System Info', 'Language', {
      status: 'pass',
      description: navigator.language
    });

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.updateStatus('Client System Info', 'Timezone', {
      status: 'pass',
      description: tz
    });
  }

  private updateViewportSize() {
    this.updateStatus('Client System Info', 'Viewport Size', {
      status: 'pass',
      description: `${window.innerWidth}x${window.innerHeight}`
    });
  }
}
