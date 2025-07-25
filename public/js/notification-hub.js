// Complete Notification Integration for CanadaAccountants
// Connects all notification systems: Browser, Email, Slack, SMS

class CanadaAccountantsNotificationHub {
    constructor() {
        this.browserNotifications = null;
        this.emailService = null;
        this.isInitialized = false;
        
        // Notification preferences
        this.preferences = {
            email: true,
            browser: true,
            slack: false,
            sms: false,
            quietHours: {
                enabled: true,
                start: '22:00',
                end: '07:00'
            }
        };

        // Business thresholds for automated alerts
        this.thresholds = {
            guaranteeClaimRate: 5.0,        // Alert if > 5%
            cpaUtilization: 60.0,           // Alert if < 60%
            revenueGrowth: 10.0,            // Alert if < 10%
            platformUptime: 99.5,           // Alert if < 99.5%
            responseTime: 2000,             // Alert if > 2000ms
            activeUsers: 200                // Alert if < 200
        };

        this.init();
    }

    async init() {
        try {
            // Initialize browser notifications
            if (typeof NotificationSystem !== 'undefined') {
                this.browserNotifications = new NotificationSystem();
            }

            // Initialize email service
            if (typeof EmailNotificationService !== 'undefined') {
                this.emailService = new EmailNotificationService();
            }

            // Request browser notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                await Notification.requestPermission();
            }

            this.isInitialized = true;
            console.log('🔔 CanadaAccountants Notification Hub initialized');
            
            // Start monitoring business metrics
            this.startMetricsMonitoring();
            
        } catch (error) {
            console.error('Failed to initialize notification hub:', error);
        }
    }

    // Send notification through multiple channels
    async notify(type, data, options = {}) {
        if (!this.isInitialized) {
            console.warn('Notification hub not initialized');
            return;
        }

        // Check quiet hours
        if (this.isQuietHours() && !options.urgent) {
            console.log('📵 Quiet hours active, notification delayed');
            this.queueNotification(type, data, options);
            return;
        }

        const results = {};

        try {
            // Browser notification
            if (this.preferences.browser && this.browserNotifications) {
                results.browser = this.browserNotifications.createNotification(
                    options.notificationType || 'info',
                    options.icon || '🔔',
                    data.title || type,
                    data.message || data.content,
                    options.actions || []
                );
            }

            // Email notification
            if (this.preferences.email && this.emailService) {
                results.email = await this.emailService.sendNotification(
                    type, 
                    data, 
                    ['email']
                );
            }

            // Slack notification (if enabled)
            if (this.preferences.slack && this.emailService) {
                results.slack = await this.emailService.sendNotification(
                    type, 
                    data, 
                    ['slack']
                );
            }

            // SMS notification (urgent only)
            if (this.preferences.sms && options.urgent && this.emailService) {
                results.sms = await this.emailService.sendNotification(
                    type, 
                    data, 
                    ['sms']
                );
            }

            console.log(`📬 Notification sent: ${type}`, results);
            return results;

        } catch (error) {
            console.error('Notification failed:', error);
            return { error: error.message };
        }
    }

    // Business event handlers
    async onNewCPAApplication(cpaData) {
        await this.notify('newCPAApplication', {
            title: 'New CPA Application',
            content: `${cpaData.name} from ${cpaData.location} has applied`,
            ...cpaData
        }, {
            notificationType: 'success',
            icon: '👨‍💼',
            actions: [
                { text: 'Review Application', type: 'primary' },
                { text: 'View Profile', type: 'secondary' }
            ]
        });
    }

    async onNewSMERegistration(smeData) {
        await this.notify('newSMERegistration', {
            title: 'New SME Registration',
            content: `${smeData.companyName} registered seeking ${smeData.services.join(', ')}`,
            ...smeData
        }, {
            notificationType: 'info',
            icon: '🏢',
            actions: [
                { text: 'Find Matches', type: 'primary' }
            ]
        });
    }

    async onSuccessfulMatch(matchData) {
        await this.notify('successfulMatch', {
            title: 'Successful Match',
            content: `${matchData.smeName} matched with ${matchData.cpaName} (${matchData.matchScore}%)`,
            ...matchData
        }, {
            notificationType: 'success',
            icon: '🎯',
            actions: [
                { text: 'View Details', type: 'primary' }
            ]
        });
    }

    async onPaymentReceived(paymentData) {
        await this.notify('paymentReceived', {
            title: 'Payment Received',
            content: `$${paymentData.amount} payment from ${paymentData.customerName}`,
            ...paymentData
        }, {
            notificationType: 'success',
            icon: '💳'
        });
    }

    async onGuaranteeClaim(claimData) {
        await this.notify('guaranteeClaim', {
            title: 'URGENT: Guarantee Claim',
            content: `${claimData.companyName} submitted claim for $${claimData.claimAmount}`,
            ...claimData
        }, {
            notificationType: 'error',
            icon: '⚠️',
            urgent: true,
            actions: [
                { text: 'Handle Claim', type: 'primary' },
                { text: 'Contact Client', type: 'secondary' }
            ]
        });
    }

    async onPlatformAlert(alertData) {
        await this.notify('platformAlert', {
            title: 'Platform Alert',
            content: `${alertData.alertType}: ${alertData.description}`,
            ...alertData
        }, {
            notificationType: alertData.severity === 'critical' ? 'error' : 'warning',
            icon: '🚨',
            urgent: alertData.severity === 'critical'
        });
    }

    // Business metrics monitoring
    startMetricsMonitoring() {
        // Monitor key business metrics every 5 minutes
        setInterval(() => {
            this.checkBusinessThresholds();
        }, 5 * 60 * 1000);

        console.log('📊 Business metrics monitoring started');
    }

    async checkBusinessThresholds() {
        // Simulate getting real metrics (in production, this would fetch from your analytics API)
        const metrics = await this.getCurrentMetrics();

        // Check guarantee claim rate
        if (metrics.guaranteeClaimRate > this.thresholds.guaranteeClaimRate) {
            await this.onPlatformAlert({
                alertType: 'High Guarantee Claim Rate',
                description: `Claim rate at ${metrics.guaranteeClaimRate}% (threshold: ${this.thresholds.guaranteeClaimRate}%)`,
                severity: 'warning',
                affectedUsers: 'All SMEs',
                uptime: metrics.uptime,
                activeUsers: metrics.activeUsers,
                responseTime: metrics.responseTime,
                errorRate: metrics.errorRate
            });
        }

        // Check CPA utilization
        if (metrics.cpaUtilization < this.thresholds.cpaUtilization) {
            await this.onPlatformAlert({
                alertType: 'Low CPA Utilization',
                description: `CPA utilization at ${metrics.cpaUtilization}% (threshold: ${this.thresholds.cpaUtilization}%)`,
                severity: 'info',
                affectedUsers: 'CPAs',
                uptime: metrics.uptime,
                activeUsers: metrics.activeUsers,
                responseTime: metrics.responseTime,
                errorRate: metrics.errorRate
            });
        }

        // Check platform uptime
        if (metrics.uptime < this.thresholds.platformUptime) {
            await this.onPlatformAlert({
                alertType: 'Platform Uptime Low',
                description: `Uptime at ${metrics.uptime}% (threshold: ${this.thresholds.platformUptime}%)`,
                severity: 'critical',
                affectedUsers: 'All users',
                uptime: metrics.uptime,
                activeUsers: metrics.activeUsers,
                responseTime: metrics.responseTime,
                errorRate: metrics.errorRate
            });
        }

        // Check active users
        if (metrics.activeUsers < this.thresholds.activeUsers) {
            await this.onPlatformAlert({
                alertType: 'Low Active Users',
                description: `Only ${metrics.activeUsers} active users (threshold: ${this.thresholds.activeUsers})`,
                severity: 'warning',
                affectedUsers: 'Platform growth',
                uptime: metrics.uptime,
                activeUsers: metrics.activeUsers,
                responseTime: metrics.responseTime,
                errorRate: metrics.errorRate
            });
        }
    }

    // Get current business metrics (simulated)
    async getCurrentMetrics() {
        // In production, this would fetch from your real analytics API
        return {
            guaranteeClaimRate: Math.random() * 8, // 0-8%
            cpaUtilization: 55 + Math.random() * 40, // 55-95%
            revenueGrowth: 5 + Math.random() * 20, // 5-25%
            uptime: 99.0 + Math.random() * 1, // 99-100%
            responseTime: 800 + Math.random() * 1500, // 800-2300ms
            activeUsers: 180 + Math.random() * 100, // 180-280
            errorRate: Math.random() * 3 // 0-3%
        };
    }

    // Quiet hours management
    isQuietHours() {
        if (!this.preferences.quietHours.enabled) return false;

        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        
        const start = this.parseTime(this.preferences.quietHours.start);
        const end = this.parseTime(this.preferences.quietHours.end);

        if (start > end) {
            // Overnight quiet hours (e.g., 22:00 to 07:00)
            return currentTime >= start || currentTime <= end;
        } else {
            // Same day quiet hours
            return currentTime >= start && currentTime <= end;
        }
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 100 + minutes;
    }

    queueNotification(type, data, options) {
        // In production, store in database or localStorage
        const queuedNotification = {
            type,
            data,
            options,
            queuedAt: new Date().toISOString()
        };
        
        console.log('📝 Notification queued for later:', queuedNotification);
    }

    // Update preferences
    updatePreferences(newPreferences) {
        this.preferences = { ...this.preferences, ...newPreferences };
        console.log('⚙️ Notification preferences updated:', this.preferences);
    }

    // Update business thresholds
    updateThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
        console.log('📊 Business thresholds updated:', this.thresholds);
    }

    // Test notification system
    async testNotifications() {
        console.log('🧪 Testing notification system...');

        // Test each notification type
        const testData = {
            cpa: {
                name: 'Test CPA',
                location: 'Toronto, ON',
                specialties: ['Technology', 'Testing'],
                experience: 5,
                licenseStatus: 'Active'
            },
            sme: {
                companyName: 'Test Company',
                industry: 'Technology',
                services: ['Tax Preparation'],
                location: 'Toronto, ON',
                employeeCount: 25,
                revenue: '$1M-$5M',
                urgency: 'Medium'
            },
            match: {
                smeName: 'Test Company',
                smeIndustry: 'Technology',
                cpaName: 'Test CPA',
                matchScore: 95,
                projectedRevenue: 5000
            },
            payment: {
                amount: 299,
                customerName: 'Test CPA',
                planType: 'Premium',
                transactionId: 'test_123'
            },
            claim: {
                companyName: 'Test Company',
                cpaName: 'Test CPA',
                claimReason: 'Testing guarantee system',
                claimAmount: 299,
                guaranteePeriod: 30
            }
        };

        await this.onNewCPAApplication(testData.cpa);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.onNewSMERegistration(testData.sme);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.onSuccessfulMatch(testData.match);
        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.onPaymentReceived(testData.payment);
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('✅ Notification system test completed');
    }
}

// Global initialization
let notificationHub;

function initializeNotificationHub() {
    notificationHub = new CanadaAccountantsNotificationHub();
    
    // Make available globally
    window.notificationHub = notificationHub;
    
    console.log('🚀 CanadaAccountants Notification Hub ready');
    return notificationHub;
}

// Auto-initialize when included
if (typeof window !== 'undefined') {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeNotificationHub);
    } else {
        initializeNotificationHub();
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanadaAccountantsNotificationHub;
}
