"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsService = void 0;
class LogsService {
    constructor() {
        this.logEntries = [];
        this.initializeSampleLogs();
    }
    initializeSampleLogs() {
        const sampleLogs = [
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
    async getLogs(filters = {}) {
        let logs = [...this.logEntries];
        if (filters.level && filters.level !== 'all') {
            logs = logs.filter(log => log.level === filters.level);
        }
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (filters.limit) {
            logs = logs.slice(0, filters.limit);
        }
        return {
            logs,
            total: this.logEntries.length,
            filtered: logs.length
        };
    }
    addLog(entry) {
        const logEntry = {
            ...entry,
            timestamp: new Date().toISOString()
        };
        this.logEntries.unshift(logEntry);
        if (this.logEntries.length > 1000) {
            this.logEntries = this.logEntries.slice(0, 1000);
        }
    }
}
exports.LogsService = LogsService;
