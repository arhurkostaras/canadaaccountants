// API Configuration for CanadaAccountants
const API_CONFIG = {
    BASE_URL: 'https://canadaaccountants-backend-production.up.railway.app',
    ENDPOINTS: {
        HEALTH: '/api/health',
        AUTH: {
            LOGIN: '/api/auth/login',
            REGISTER: '/api/auth/register'
        },
        PROFILES: {
            CPAS: '/api/profiles/cpas',
            SMES: '/api/profiles/smes'
        },
        MATCHES: '/api/matches'
    }
};

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const url = API_CONFIG.BASE_URL + endpoint;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    return response.json();
}

