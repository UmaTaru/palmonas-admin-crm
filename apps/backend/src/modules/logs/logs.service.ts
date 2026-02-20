import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  requestId?: string;
  userId?: number;
  email?: string;
}

interface LogFilters {
  limit?: number;
  level?: string;
}

export class LogsService {
  private logEntries: LogEntry[] = [];

  constructor() {
    // Initialize with some sample logs for demonstration
    this.initializeSampleLogs();
  }

  private initializeSampleLogs() {
    const sampleLogs: LogEntry[] = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Backend server started successfully',
        requestId: 'startup-001'
      },
      {
        timestamp: new Date(Date.now() - 5000).toISOString(),
        level: 'info',
        message: 'Database connection established',
        requestId: 'db-001'
      },
      {
        timestamp: new Date(Date.now() - 10000).toISOString(),
        level: 'info',
        message: 'Redis connection established',
        requestId: 'redis-001'
      },
      {
        timestamp: new Date(Date.now() - 15000).toISOString(),
        level: 'info',
        message: 'User login successful',
        requestId: 'auth-001',
        userId: 1,
        email: 'admin@palmonas.com'
      },
      {
        timestamp: new Date(Date.now() - 20000).toISOString(),
        level: 'info',
        message: 'Orders fetched successfully',
        requestId: 'orders-001',
        userId: 1
      },
      {
        timestamp: new Date(Date.now() - 25000).toISOString(),
        level: 'warn',
        message: 'Cache miss for orders query',
        requestId: 'cache-001'
      },
      {
        timestamp: new Date(Date.now() - 30000).toISOString(),
        level: 'error',
        message: 'Failed to connect to external API',
        requestId: 'api-001'
      },
      {
        timestamp: new Date(Date.now() - 35000).toISOString(),
        level: 'info',
        message: 'Health check endpoint accessed',
        requestId: 'health-001'
      }
    ];

    this.logEntries = sampleLogs;
  }

  async getLogs(filters: LogFilters = {}) {
    let logs = [...this.logEntries];

    // Filter by level if specified
    if (filters.level && filters.level !== 'all') {
      logs = logs.filter(log => log.level === filters.level);
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    if (filters.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return {
      logs,
      total: this.logEntries.length,
      filtered: logs.length
    };
  }

  // Method to add new log entries (for future use)
  addLog(entry: Omit<LogEntry, 'timestamp'>) {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    
    this.logEntries.unshift(logEntry);
    
    // Keep only last 1000 logs to prevent memory issues
    if (this.logEntries.length > 1000) {
      this.logEntries = this.logEntries.slice(0, 1000);
    }
  }
}
