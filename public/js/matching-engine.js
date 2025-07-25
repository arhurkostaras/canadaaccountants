/**
 * Enhanced Matching Algorithm for CanadaAccountants
 * Intelligently matches CPAs with SMEs based on multiple factors
 */

class EnhancedMatcher {
  constructor() {
    this.weights = {
      industry: 0.25,    // 25% - Industry expertise match
      size: 0.20,        // 20% - Business size compatibility
      services: 0.25,    // 25% - Service needs alignment
      location: 0.15,    // 15% - Geographic proximity
      availability: 0.10, // 10% - CPA availability
      success: 0.05      // 5% - Historical success rate
    };

    // Industry categories with specialization scores
    this.industries = {
      'technology': ['software', 'saas', 'fintech', 'e-commerce', 'ai'],
      'healthcare': ['medical', 'dental', 'pharmacy', 'biotech', 'wellness'],
      'manufacturing': ['automotive', 'aerospace', 'food', 'textiles', 'chemicals'],
      'retail': ['fashion', 'grocery', 'electronics', 'furniture', 'sporting goods'],
      'professional_services': ['consulting', 'legal', 'marketing', 'hr', 'real estate'],
      'construction': ['residential', 'commercial', 'infrastructure', 'renovation'],
      'hospitality': ['hotels', 'restaurants', 'tourism', 'events', 'catering'],
      'financial_services': ['banking', 'insurance', 'investment', 'credit unions'],
      'non_profit': ['charity', 'foundation', 'association', 'religious', 'education']
    };

    // Business size categories
    this.businessSizes = {
      'micro': { employees: [1, 4], revenue: [0, 250000] },
      'small': { employees: [5, 49], revenue: [250000, 2000000] },
      'medium': { employees: [50, 249], revenue: [2000000, 20000000] },
      'large': { employees: [250, 999], revenue: [20000000, 100000000] }
    };

    // Service types with complexity scores
    this.services = {
      'bookkeeping': { complexity: 1, frequency: 'monthly' },
      'tax_preparation': { complexity: 2, frequency: 'annual' },
      'tax_planning': { complexity: 3, frequency: 'quarterly' },
      'financial_statements': { complexity: 3, frequency: 'quarterly' },
      'audit': { complexity: 4, frequency: 'annual' },
      'cfo_services': { complexity: 5, frequency: 'ongoing' },
      'business_advisory': { complexity: 4, frequency: 'ongoing' },
      'succession_planning': { complexity: 5, frequency: 'project' },
      'mergers_acquisitions': { complexity: 5, frequency: 'project' }
    };
  }

  /**
   * Main matching function - calculates overall match score
   */
  calculateMatchScore(cpa, sme) {
    const scores = {
      industry: this.calculateIndustryMatch(cpa, sme),
      size: this.calculateSizeMatch(cpa, sme),
      services: this.calculateServiceMatch(cpa, sme),
      location: this.calculateLocationMatch(cpa, sme),
      availability: this.calculateAvailabilityMatch(cpa, sme),
      success: this.calculateSuccessScore(cpa)
    };

    const weightedScore = this.weightedScore(scores);
    
    return {
      totalScore: weightedScore,
      breakdown: scores,
      recommendation: this.getRecommendationLevel(weightedScore),
      reasons: this.getMatchReasons(scores, cpa, sme)
    };
  }

  /**
   * Calculate industry expertise match (0-100)
   */
  calculateIndustryMatch(cpa, sme) {
    if (!cpa.industries || !sme.industry) return 50; // Neutral if no data

    const smeIndustry = sme.industry.toLowerCase();
    const cpaIndustries = cpa.industries.map(ind => ind.toLowerCase());

    // Direct industry match
    if (cpaIndustries.includes(smeIndustry)) {
      return 100;
    }

    // Check for industry category match
    for (const [category, subIndustries] of Object.entries(this.industries)) {
      const smeInCategory = subIndustries.some(sub => smeIndustry.includes(sub));
      const cpaInCategory = cpaIndustries.some(cpaInd => 
        subIndustries.some(sub => cpaInd.includes(sub))
      );

      if (smeInCategory && cpaInCategory) {
        return 80; // Good category match
      }
    }

    // Check for related industries
    const relatedScore = this.calculateRelatedIndustryScore(cpaIndustries, smeIndustry);
    return Math.max(relatedScore, 30); // Minimum score for experience
  }

  /**
   * Calculate business size compatibility (0-100)
   */
  calculateSizeMatch(cpa, sme) {
    if (!cpa.clientSizes || !sme.size) return 50;

    const smeSize = this.categorizeBusinessSize(sme);
    const cpaExperience = cpa.clientSizes || [];

    // Perfect match if CPA has experience with this size
    if (cpaExperience.includes(smeSize)) {
      return 100;
    }

    // Partial match for adjacent sizes
    const sizeOrder = ['micro', 'small', 'medium', 'large'];
    const smeIndex = sizeOrder.indexOf(smeSize);
    
    for (const expSize of cpaExperience) {
      const expIndex = sizeOrder.indexOf(expSize);
      const difference = Math.abs(smeIndex - expIndex);
      
      if (difference === 1) return 70; // Adjacent size
      if (difference === 2) return 40; // Two sizes apart
    }

    return 20; // No size match
  }

  /**
   * Calculate service needs alignment (0-100)
   */
  calculateServiceMatch(cpa, sme) {
    if (!cpa.services || !sme.servicesNeeded) return 50;

    const cpaServices = cpa.services.map(s => s.toLowerCase());
    const smeNeeds = sme.servicesNeeded.map(s => s.toLowerCase());

    let matchCount = 0;
    let totalComplexity = 0;
    let matchedComplexity = 0;

    for (const need of smeNeeds) {
      const serviceComplexity = this.services[need]?.complexity || 1;
      totalComplexity += serviceComplexity;

      if (cpaServices.includes(need)) {
        matchCount++;
        matchedComplexity += serviceComplexity;
      }
    }

    // Calculate match percentage with complexity weighting
    const basicMatch = (matchCount / smeNeeds.length) * 100;
    const complexityBonus = totalComplexity > 0 ? (matchedComplexity / totalComplexity) * 20 : 0;

    return Math.min(basicMatch + complexityBonus, 100);
  }

  /**
   * Calculate geographic proximity score (0-100)
   */
  calculateLocationMatch(cpa, sme) {
    if (!cpa.location || !sme.location) return 50;

    // Same city = 100
    if (cpa.location.city === sme.location.city) {
      return 100;
    }

    // Same province = 80
    if (cpa.location.province === sme.location.province) {
      return 80;
    }

    // Adjacent provinces = 60
    const adjacentProvinces = this.getAdjacentProvinces(sme.location.province);
    if (adjacentProvinces.includes(cpa.location.province)) {
      return 60;
    }

    // Same country = 40
    if (cpa.location.country === sme.location.country) {
      return 40;
    }

    return 20; // Different country
  }

  /**
   * Calculate CPA availability score (0-100)
   */
  calculateAvailabilityMatch(cpa, sme) {
    if (!cpa.availability) return 50;

    const now = new Date();
    const urgency = sme.urgency || 'normal';
    
    // Check current capacity
    const currentCapacity = cpa.availability.currentCapacity || 0;
    const maxCapacity = cpa.availability.maxCapacity || 100;
    const availableCapacity = maxCapacity - currentCapacity;
    
    let baseScore = (availableCapacity / maxCapacity) * 100;

    // Adjust for urgency
    if (urgency === 'urgent' && availableCapacity < 20) {
      baseScore *= 0.5; // Penalize low availability for urgent needs
    } else if (urgency === 'flexible' && availableCapacity > 50) {
      baseScore *= 1.2; // Bonus for high availability with flexible timing
    }

    return Math.min(Math.max(baseScore, 0), 100);
  }

  /**
   * Calculate historical success score (0-100)
   */
  calculateSuccessScore(cpa) {
    if (!cpa.performance) return 75; // Default good score

    const metrics = cpa.performance;
    let score = 0;

    // Client satisfaction (40% weight)
    if (metrics.clientSatisfaction) {
      score += (metrics.clientSatisfaction / 5) * 40;
    }

    // Response time (20% weight)
    if (metrics.averageResponseTime) {
      const responseScore = Math.max(100 - metrics.averageResponseTime, 0);
      score += (responseScore / 100) * 20;
    }

    // Completion rate (20% weight)
    if (metrics.projectCompletionRate) {
      score += metrics.projectCompletionRate * 20;
    }

    // Years of experience (20% weight)
    if (metrics.yearsExperience) {
      const expScore = Math.min(metrics.yearsExperience * 5, 100);
      score += (expScore / 100) * 20;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate weighted final score
   */
  weightedScore(scores) {
    let totalScore = 0;
    for (const [factor, score] of Object.entries(scores)) {
      totalScore += score * this.weights[factor];
    }
    return Math.round(totalScore);
  }

  /**
   * Get recommendation level based on score
   */
  getRecommendationLevel(score) {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'very_good';
    if (score >= 55) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  /**
   * Generate human-readable match reasons
   */
  getMatchReasons(scores, cpa, sme) {
    const reasons = [];

    if (scores.industry >= 80) {
      reasons.push(`Strong industry expertise in ${sme.industry}`);
    }
    if (scores.services >= 80) {
      reasons.push(`Excellent service alignment for your needs`);
    }
    if (scores.location >= 80) {
      reasons.push(`Convenient local presence`);
    }
    if (scores.size >= 80) {
      reasons.push(`Proven experience with ${this.categorizeBusinessSize(sme)} businesses`);
    }
    if (scores.availability >= 80) {
      reasons.push(`High availability for new clients`);
    }
    if (scores.success >= 85) {
      reasons.push(`Outstanding track record and client satisfaction`);
    }

    return reasons;
  }

  /**
   * Helper functions
   */
  categorizeBusinessSize(sme) {
    const employees = sme.employees || 0;
    const revenue = sme.revenue || 0;

    for (const [size, criteria] of Object.entries(this.businessSizes)) {
      if (employees >= criteria.employees[0] && employees <= criteria.employees[1] &&
          revenue >= criteria.revenue[0] && revenue <= criteria.revenue[1]) {
        return size;
      }
    }
    return 'small'; // Default
  }

  calculateRelatedIndustryScore(cpaIndustries, smeIndustry) {
    // Logic for calculating related industry scores
    // This could be expanded with more sophisticated industry relationship mapping
    return 30;
  }

  getAdjacentProvinces(province) {
    const adjacency = {
      'ON': ['QC', 'MB', 'NY', 'MI', 'MN'],
      'QC': ['ON', 'NB', 'NL', 'ME', 'NH', 'VT', 'NY'],
      'BC': ['AB', 'YT', 'AK', 'WA'],
      'AB': ['BC', 'SK', 'NT', 'MT'],
      'SK': ['AB', 'MB', 'NT', 'ND'],
      'MB': ['SK', 'ON', 'NU', 'ND', 'MN'],
      'NB': ['QC', 'NS', 'PE', 'ME'],
      'NS': ['NB', 'PE'],
      'PE': ['NB', 'NS'],
      'NL': ['QC'],
      'YT': ['BC', 'NT', 'AK'],
      'NT': ['YT', 'NU', 'AB', 'SK'],
      'NU': ['NT', 'MB']
    };
    return adjacency[province] || [];
  }

  /**
   * Batch matching function for multiple CPAs
   */
  findBestMatches(sme, cpaList, limit = 10) {
    const matches = cpaList.map(cpa => ({
      cpa,
      match: this.calculateMatchScore(cpa, sme)
    }));

    // Sort by total score descending
    matches.sort((a, b) => b.match.totalScore - a.match.totalScore);

    return matches.slice(0, limit);
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedMatcher;
}

// Global availability for browser use
if (typeof window !== 'undefined') {
  window.EnhancedMatcher = EnhancedMatcher;
}
