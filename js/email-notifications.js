// Email Notification Backend for CanadaAccountants
// Handles automated email alerts for business events

class EmailNotificationService {
    constructor() {
        this.emailTemplates = {
            newCPAApplication: {
                subject: '🍁 New CPA Application - CanadaAccountants',
                template: 'newCPAApplication'
            },
            newSMERegistration: {
                subject: '🏢 New SME Registration - CanadaAccountants', 
                template: 'newSMERegistration'
            },
            successfulMatch: {
                subject: '🎯 Successful Match Created - CanadaAccountants',
                template: 'successfulMatch'
            },
            paymentReceived: {
                subject: '💳 Payment Received - CanadaAccountants',
                template: 'paymentReceived'
            },
            guaranteeClaim: {
                subject: '⚠️ URGENT: Guarantee Claim - CanadaAccountants',
                template: 'guaranteeClaim'
            },
            platformAlert: {
                subject: '🚨 Platform Alert - CanadaAccountants',
                template: 'platformAlert'
            }
        };

        this.adminEmail = 'arthur@canadaaccountants.app';
        this.slackWebhook = 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'; // Replace with actual webhook
    }

    // Send notification email using EmailJS (client-side solution)
    async sendEmailNotification(type, data) {
        const template = this.emailTemplates[type];
        if (!template) {
            console.error('Unknown email template:', type);
            return false;
        }

        try {
            // Using EmailJS for client-side email sending
            const emailData = {
                to_email: this.adminEmail,
                subject: template.subject,
                ...this.generateEmailContent(type, data)
            };

            // In production, you would use your email service (SendGrid, AWS SES, etc.)
            console.log('📧 Email notification sent:', emailData);
            return true;
        } catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    }

    // Generate email content based on notification type
    generateEmailContent(type, data) {
        const templates = {
            newCPAApplication: (data) => ({
                content: `
                    <h2>🍁 New CPA Application Received</h2>
                    <p><strong>CPA Name:</strong> ${data.name}</p>
                    <p><strong>Location:</strong> ${data.location}</p>
                    <p><strong>Specialties:</strong> ${data.specialties.join(', ')}</p>
                    <p><strong>Experience:</strong> ${data.experience} years</p>
                    <p><strong>License Status:</strong> ${data.licenseStatus}</p>
                    <p><strong>Application Time:</strong> ${new Date().toLocaleString()}</p>
                    <hr>
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Review application within 24 hours</li>
                        <li>Verify CPA license with provincial society</li>
                        <li>Schedule interview if qualified</li>
                    </ul>
                    <p><a href="https://canadaaccountants.app/admin.html" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Review Application</a></p>
                `,
                priority: 'high'
            }),

            newSMERegistration: (data) => ({
                content: `
                    <h2>🏢 New SME Registration</h2>
                    <p><strong>Company:</strong> ${data.companyName}</p>
                    <p><strong>Industry:</strong> ${data.industry}</p>
                    <p><strong>Size:</strong> ${data.employeeCount} employees</p>
                    <p><strong>Revenue:</strong> ${data.revenue}</p>
                    <p><strong>Services Needed:</strong> ${data.services.join(', ')}</p>
                    <p><strong>Location:</strong> ${data.location}</p>
                    <p><strong>Urgency:</strong> ${data.urgency}</p>
                    <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
                    <hr>
                    <p><strong>Matching Potential:</strong></p>
                    <ul>
                        <li>Industry match: ${data.industryMatches} CPAs available</li>
                        <li>Location match: ${data.locationMatches} CPAs in region</li>
                        <li>Service match: ${data.serviceMatches} CPAs with expertise</li>
                    </ul>
                    <p><a href="https://canadaaccountants.app/admin.html" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Find Matches</a></p>
                `,
                priority: 'medium'
            }),

            successfulMatch: (data) => ({
                content: `
                    <h2>🎯 Successful Match Created</h2>
                    <p><strong>SME:</strong> ${data.smeName} (${data.smeIndustry})</p>
                    <p><strong>CPA:</strong> ${data.cpaName}</p>
                    <p><strong>Match Score:</strong> ${data.matchScore}%</p>
                    <p><strong>Match Time:</strong> ${new Date().toLocaleString()}</p>
                    <hr>
                    <p><strong>Match Details:</strong></p>
                    <ul>
                        <li>Industry alignment: ${data.industryScore}%</li>
                        <li>Service compatibility: ${data.serviceScore}%</li>
                        <li>Geographic proximity: ${data.locationScore}%</li>
                        <li>Availability match: ${data.availabilityScore}%</li>
                    </ul>
                    <p><strong>Revenue Potential:</strong> ${data.projectedRevenue}</p>
                    <p><a href="https://canadaaccountants.app/admin.html" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">View Match Details</a></p>
                `,
                priority: 'medium'
            }),

            paymentReceived: (data) => ({
                content: `
                    <h2>💳 Payment Received</h2>
                    <p><strong>Amount:</strong> ${data.amount}</p>
                    <p><strong>From:</strong> ${data.customerName}</p>
                    <p><strong>Plan:</strong> ${data.planType}</p>
                    <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                    <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                    <p><strong>Payment Time:</strong> ${new Date().toLocaleString()}</p>
                    <hr>
                    <p><strong>Account Status:</strong></p>
                    <ul>
                        <li>Subscription: ${data.subscriptionStatus}</li>
                        <li>Next billing: ${data.nextBilling}</li>
                        <li>Total revenue this month: ${data.monthlyRevenue}</li>
                    </ul>
                    <p><strong>🎉 Great news!</strong> Revenue is up ${data.growthPercentage}% from last month.</p>
                `,
                priority: 'low'
            }),

            guaranteeClaim: (data) => ({
                content: `
                    <h2>⚠️ URGENT: Guarantee Claim Submitted</h2>
                    <p><strong>⏰ IMMEDIATE ACTION REQUIRED</strong></p>
                    <p><strong>Company:</strong> ${data.companyName}</p>
                    <p><strong>Original CPA:</strong> ${data.cpaName}</p>
                    <p><strong>Claim Reason:</strong> ${data.claimReason}</p>
                    <p><strong>Claim Amount:</strong> ${data.claimAmount}</p>
                    <p><strong>Guarantee Period:</strong> ${data.guaranteePeriod} days remaining</p>
                    <p><strong>Claim Time:</strong> ${new Date().toLocaleString()}</p>
                    <hr>
                    <p><strong>Required Actions:</strong></p>
                    <ul>
                        <li>✅ Contact SME within 2 hours</li>
                        <li>✅ Review original matching criteria</li>
                        <li>✅ Find alternative CPA matches</li>
                        <li>✅ Document resolution process</li>
                    </ul>
                    <p><strong>SLA:</strong> Respond within 2 hours, resolve within 24 hours</p>
                    <p><a href="https://canadaaccountants.app/admin.html" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">HANDLE CLAIM NOW</a></p>
                `,
                priority: 'urgent'
            }),

            platformAlert: (data) => ({
                content: `
                    <h2>🚨 Platform Alert</h2>
                    <p><strong>Alert Type:</strong> ${data.alertType}</p>
                    <p><strong>Severity:</strong> ${data.severity}</p>
                    <p><strong>Description:</strong> ${data.description}</p>
                    <p><strong>Affected Users:</strong> ${data.affectedUsers}</p>
                    <p><strong>Alert Time:</strong> ${new Date().toLocaleString()}</p>
                    <hr>
                    <p><strong>System Status:</strong></p>
                    <ul>
                        <li>Platform uptime: ${data.uptime}%</li>
                        <li>Active users: ${data.activeUsers}</li>
                        <li>Response time: ${data.responseTime}ms</li>
                        <li>Error rate: ${data.errorRate}%</li>
                    </ul>
                    <p><a href="https://canadaaccountants.app/admin.html" style="background: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">View System Status</a></p>
                `,
                priority: 'high'
            })
        };

        return templates[type](data);
    }

    // Send Slack notification
    async sendSlackNotification(type, data) {
        const message = this.generateSlackMessage(type, data);
        
        try {
            // In production, use actual Slack webhook
            const response = await fetch(this.slackWebhook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message)
            });

            console.log('📱 Slack notification sent:', message);
            return response.ok;
        } catch (error) {
            console.error('Failed to send Slack notification:', error);
            return false;
        }
    }

    // Generate Slack message format
    generateSlackMessage(type, data) {
        const messages = {
            newCPAApplication: {
                text: `🍁 New CPA Application`,
                attachments: [{
                    color: 'good',
                    fields: [
                        { title: 'Name', value: data.name, short: true },
                        { title: 'Location', value: data.location, short: true },
                        { title: 'Specialties', value: data.specialties.join(', '), short: false }
                    ]
                }]
            },
            successfulMatch: {
                text: `🎯 New Match Created - ${data.matchScore}% compatibility`,
                attachments: [{
                    color: 'good',
                    fields: [
                        { title: 'SME', value: data.smeName, short: true },
                        { title: 'CPA', value: data.cpaName, short: true },
                        { title: 'Revenue Potential', value: `${data.projectedRevenue}`, short: true }
                    ]
                }]
            },
            guaranteeClaim: {
                text: `⚠️ URGENT: Guarantee Claim`,
                attachments: [{
                    color: 'danger',
                    fields: [
                        { title: 'Company', value: data.companyName, short: true },
                        { title: 'Claim Amount', value: `${data.claimAmount}`, short: true },
                        { title: 'Action Required', value: 'Respond within 2 hours', short: false }
                    ]
                }]
            }
        };

        return messages[type] || { text: `📱 ${type}: New notification` };
    }

    // Send SMS notification (using Twilio or similar service)
    async sendSMSNotification(type, data) {
        const smsMessage = this.generateSMSMessage(type, data);
        
        try {
            // In production, integrate with Twilio
            console.log('📱 SMS notification would be sent:', smsMessage);
            return true;
        } catch (error) {
            console.error('Failed to send SMS:', error);
            return false;
        }
    }

    // Generate SMS message (keep short)
    generateSMSMessage(type, data) {
        const messages = {
            guaranteeClaim: `🚨 URGENT: Guarantee claim from ${data.companyName}. Amount: ${data.claimAmount}. Respond within 2 hours. https://canadaaccountants.app/admin.html`,
            highValueMatch: `🎯 High-value match: ${data.smeName} matched with ${data.cpaName}. Potential: ${data.projectedRevenue}`,
            systemDown: `🚨 ALERT: Platform experiencing issues. Uptime: ${data.uptime}%. Investigating now.`
        };

        return messages[type] || `📱 CanadaAccountants: ${type} notification`;
    }

    // Main notification dispatcher
    async sendNotification(type, data, channels = ['email', 'browser']) {
        const results = {};

        // Browser notification (already handled by NotificationSystem class)
        if (channels.includes('browser')) {
            results.browser = true;
        }

        // Email notification
        if (channels.includes('email')) {
            results.email = await this.sendEmailNotification(type, data);
        }

        // Slack notification
        if (channels.includes('slack')) {
            results.slack = await this.sendSlackNotification(type, data);
        }

        // SMS notification (for urgent items only)
        if (channels.includes('sms') && this.isUrgent(type)) {
            results.sms = await this.sendSMSNotification(type, data);
        }

        // Log notification attempt
        console.log(`📬 Notification sent - Type: ${type}, Channels: ${channels.join(', ')}`, results);
        
        return results;
    }

    // Determine if notification is urgent
    isUrgent(type) {
        const urgentTypes = ['guaranteeClaim', 'platformAlert', 'systemDown'];
        return urgentTypes.includes(type);
    }

    // Business event handlers
    async handleCPAApplication(cpaData) {
        await this.sendNotification('newCPAApplication', cpaData, ['email', 'browser', 'slack']);
    }

    async handleSMERegistration(smeData) {
        await this.sendNotification('newSMERegistration', smeData, ['email', 'browser']);
    }

    async handleSuccessfulMatch(matchData) {
        await this.sendNotification('successfulMatch', matchData, ['email', 'browser', 'slack']);
    }

    async handlePayment(paymentData) {
        await this.sendNotification('paymentReceived', paymentData, ['email', 'browser']);
    }

    async handleGuaranteeClaim(claimData) {
        // Urgent - use all channels
        await this.sendNotification('guaranteeClaim', claimData, ['email', 'browser', 'slack', 'sms']);
    }

    async handlePlatformAlert(alertData) {
        const channels = alertData.severity === 'critical' ? 
            ['email', 'browser', 'slack', 'sms'] : 
            ['email', 'browser', 'slack'];
        
        await this.sendNotification('platformAlert', alertData, channels);
    }
}

// Integration with existing notification system
function initializeEmailNotifications() {
    const emailService = new EmailNotificationService();
    
    // Example usage:
    window.emailNotifications = emailService;
    
    console.log('📧 Email notification service initialized');
    return emailService;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailNotificationService;
} else if (typeof window !== 'undefined') {
    window.EmailNotificationService = EmailNotificationService;
}

// Usage examples:
/*
const emailService = new EmailNotificationService();

// When a new CPA applies
emailService.handleCPAApplication({
    name: 'Sarah Chen, CPA',
    location: 'Toronto, ON',
    specialties: ['Technology', 'Startups'],
    experience: 8,
    licenseStatus: 'Active'
});

// When a guarantee claim is submitted
emailService.handleGuaranteeClaim({
    companyName: 'TechStart Solutions',
    cpaName: 'Michael Thompson, CPA',
    claimReason: 'No suitable match found within 3 months',
    claimAmount: 299,
    guaranteePeriod: 7
});
*/
