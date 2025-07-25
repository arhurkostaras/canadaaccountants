# CanadaAccountants Matching Algorithm Implementation

## Scoring System (100 points total)

### 1. Geographic Compatibility (25 points)
- Same City: 25 points
- Same Province, within 50km: 20 points  
- Same Province, 51-100km: 15 points
- Same Province, 101-200km: 10 points
- Different Province: 5 points
- Remote OK: +5 bonus points

### 2. Service Specialization Match (25 points)
- Perfect Match (CPA specialty = Business need): 25 points
- Strong Match (Related specialties): 20 points
- Good Match (CPA has experience): 15 points
- Basic Match (CPA willing to learn): 10 points

### 3. Business Size & Complexity (20 points)
- Perfect Fit: 20 points
- Good Fit: 15 points
- Stretch Fit: 10 points
- Poor Fit: 5 points

### 4. Industry Experience (15 points)
- Specialized: 15 points
- Has Clients: 12 points
- Related Experience: 8 points
- General Experience: 5 points

### 5. Availability & Capacity (10 points)
- Immediately Available: 10 points
- Within 2 weeks: 8 points
- Within 1 month: 6 points
- Within 3 months: 4 points

### 6. Budget Alignment (5 points)
- Budget Exceeds Rate: 5 points
- Budget Matches: 4 points
- 10-20% Below: 3 points
- 20%+ Below: 1 point

## Quality Filters
- Minimum 60/100 total score
- At least 15/25 in Geographic + Specialization combined
- CPA must have capacity for new clients
- Must qualify for guarantee (5+ employees, actively seeking, geographic area)

## Implementation Notes
- Start with manual matching using this scoring
- Track match success rates
- Refine algorithm based on outcomes
- Automate when confident in results
