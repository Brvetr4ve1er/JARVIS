# CORE_SPELLS_v2.md
## Production-Grade Master Prompts for 10 Core Thinking Spells
**Optimized by: Senior AI Engineer - Prompt Systems Specialist**  
**Version:** 2.0 (Production)  
**Last Updated:** 2026-01-13  

---

## Overview
This document contains enterprise-grade master prompts for JARVIS's 10 core thinking spells. Each spell is engineered for maximum clarity, control, and output quality, with explicit instructions for constraint handling, error management, and quality assurance.

**Design Principles:**
- Explicit instruction hierarchy with fallback mechanisms
- Constraint-aware execution paths
- Quality gates and validation checkpoints
- Minimal ambiguity through structural redundancy
- Deterministic token budgeting

---

## 1. SYNTHESIZE_LOGIC

### Purpose
Combine disparate information sources into coherent, logically sound conclusions with explicit reasoning chains.

### Master Prompt
```
SYNTHESIZE_LOGIC: Logical Consolidation Engine

OBJECTIVE:
Merge multiple information streams into a unified logical framework that explicitly traces reasoning from premises to conclusions.

EXECUTION PROTOCOL:

[PHASE 1: SOURCE NORMALIZATION]
1. Identify all input assertions and their source credibility tier
2. Flag contradictions immediately with explicit notation: [CONFLICT: assertion_A vs assertion_B]
3. Normalize terminology across sources to establish shared semantic ground
4. Document all assumptions required for synthesis

[PHASE 2: LOGICAL FRAMEWORK CONSTRUCTION]
1. Build dependency graph showing how conclusions derive from premises
2. Use explicit logical operators: AND, OR, NOT, IF-THEN, BICONDITIONAL
3. Apply constraint propagation to identify impossible states
4. Mark inference steps with confidence scores: [CONFIDENCE: X/10]

[PHASE 3: COHERENCE VALIDATION]
1. Test for circular dependencies
2. Verify no contradictory obligation paths
3. Validate that conclusions are logically sufficient given premises
4. Identify any hidden assumptions not explicitly stated

[PHASE 4: SYNTHESIS DELIVERY]
1. Present unified logical model with explicit connection to sources
2. Highlight synthesis confidence level (HIGH/MEDIUM/LOW)
3. Document edge cases and exceptions
4. Provide alternative logical structures if multiple coherent models exist

OUTPUT FORMAT:
- Unified Framework: [Clear statement of consolidated logic]
- Reasoning Chain: [Numbered dependency steps]
- Confidence: [Quantified assessment]
- Alternative Structures: [If applicable]
- Unresolved Conflicts: [Explicit list with resolution strategies]

QUALITY GATES:
✓ All premises explicitly sourced
✓ No circular reasoning detected
✓ Confidence threshold met
✓ Edge cases documented
```

---

## 2. ANALYZE_CONTEXT

### Purpose
Extract relevant contextual factors, establish information hierarchy, and identify critical variables affecting interpretation.

### Master Prompt
```
ANALYZE_CONTEXT: Contextual Intelligence Extractor

OBJECTIVE:
Decompose situational context into actionable variables, hierarchical relationships, and environmental constraints that shape interpretation and decision-making.

EXECUTION PROTOCOL:

[PHASE 1: CONTEXT MAPPING]
1. Identify primary context layers:
   - TEMPORAL: Time period, deadline pressure, historical precedent
   - SPATIAL: Geographic/virtual location, scale, environmental factors
   - SOCIAL: Stakeholder roles, power dynamics, relationship histories
   - ORGANIZATIONAL: Institutional constraints, regulatory environment, incentive structures
   - TECHNOLOGICAL: Available tools, capability constraints, integration dependencies

2. Create context hierarchy:
   - TIER 1 (Critical): Factors that fundamentally change interpretation
   - TIER 2 (Influential): Factors that modify interpretation significantly
   - TIER 3 (Contextual): Factors that add nuance but don't change core meaning

[PHASE 2: VARIABLE EXTRACTION]
1. For each context layer, extract:
   - STATE VARIABLES: Current conditions (what is)
   - BOUNDARY CONDITIONS: Hard limits and constraints
   - DYNAMIC FACTORS: Things likely to change and rate of change
   - UNCERTAINTY ZONES: Areas of incomplete information

2. Establish variable relationships:
   - INDEPENDENT: Variables that don't interact
   - DEPENDENT: Clear causal or functional relationships
   - EMERGENT: Complex interactions creating new properties
   - FEEDBACK LOOPS: Reinforcing or dampening cycles

[PHASE 3: CONSTRAINT IDENTIFICATION]
1. Hard constraints: Non-negotiable limits
2. Soft constraints: Preferences with override capability
3. Hidden constraints: Unstated expectations or cultural factors
4. Constraint interactions: Where constraints amplify or conflict

[PHASE 4: INTERPRETATION IMPACT ASSESSMENT]
1. For each primary assertion, map contextual sensitivity:
   - ROBUST: Holds across contexts
   - CONTEXT-DEPENDENT: Changes with context variations
   - CONTEXT-FRAGILE: Breaks under small context changes

OUTPUT FORMAT:
- Context Layers: [Structured breakdown by category]
- Critical Variables: [Tier 1 with quantification where possible]
- Constraint Matrix: [Hard/soft constraints with impact zones]
- Interpretation Sensitivity Map: [How context shapes meaning]
- Blind Spots: [Missing context that would significantly alter analysis]

QUALITY GATES:
✓ All major context layers represented
✓ Critical variables identified and ranked
✓ Constraints explicitly enumerated
✓ Sensitivity maps complete for key assertions
```

---

## 3. EVALUATE_EVIDENCE

### Purpose
Assess information quality, source reliability, and evidentiary sufficiency using transparent, multi-criteria evaluation.

### Master Prompt
```
EVALUATE_EVIDENCE: Evidentiary Quality Assurance System

OBJECTIVE:
Apply systematic standards to evidence quality assessment, source credibility, and sufficiency for stated conclusions, with explicit methodology visibility.

EXECUTION PROTOCOL:

[PHASE 1: SOURCE CREDIBILITY ASSESSMENT]
1. Establish source evaluation matrix:
   - EXPERTISE: Does source have documented domain competence?
   - TRACK_RECORD: Historical accuracy on similar claims
   - METHODOLOGY: How was information gathered (first-hand, secondary, etc.)?
   - BIAS_FACTORS: Known incentive structures or ideological positions
   - TRANSPARENCY: How openly are limitations acknowledged?

2. Assign credibility tier (0-10 scale):
   - 9-10: Primary source, expert consensus, validated methodology
   - 7-8: Credible secondary source, specialist knowledge, documented process
   - 5-6: Mixed reliability, some biases, methodological concerns
   - 3-4: Weak source, unverified claims, clear biases
   - 0-2: Unreliable, unsubstantiated, obvious distortions

3. Flag special source categories:
   - [EXPERT_CONSENSUS]: Agreement across independent experts
   - [PEER_REVIEWED]: Subject to formal verification process
   - [FIRST_HAND]: Direct observation or participation
   - [DERIVED]: Inference from other evidence

[PHASE 2: EVIDENCE QUALITY ASSESSMENT]
1. Evaluate each evidence claim:
   - SPECIFICITY: Is claim precise or vague? [SPECIFIC/MODERATE/VAGUE]
   - VERIFIABILITY: Can claim be independently tested? [HIGH/MEDIUM/LOW]
   - FALSIFIABILITY: What evidence would disprove it? [CLEAR/UNCLEAR/UNFALSIFIABLE]
   - COMPLETENESS: Are relevant counterarguments presented? [COMPLETE/PARTIAL/SELECTIVE]

2. Assess evidence type strength:
   - QUANTITATIVE DATA: Reproducible, precise, scalable verification
   - QUALITATIVE ANALYSIS: Context-rich, interpretation-dependent
   - EXPERT JUDGMENT: Efficient but subject to individual bias
   - ANECDOTAL: Low statistical power, high narrative influence
   - THEORETICAL: Deductively sound but real-world dependent

[PHASE 3: SUFFICIENCY ANALYSIS]
1. Map evidence to claim structure:
   - Does evidence prove, support, suggest, or merely allow the claim?
   - What evidence is still missing?
   - Are there alternative explanations the evidence doesn't rule out?

2. Identify evidence gaps:
   - CRITICAL GAPS: Evidence absence that breaks the argument
   - SUPPORTING GAPS: Missing evidence that would strengthen case
   - REFINEMENT GAPS: Evidence that would add precision

[PHASE 4: CONFIDENCE DETERMINATION]
1. Calculate evidence-based confidence:
   - Combine source credibility with evidence quality
   - Apply sufficiency discount for gaps
   - Account for contradiction evidence

2. Explicit confidence statement:
   - HIGH (80-100%): Compelling evidence from credible sources
   - MEDIUM (50-79%): Reasonable support with some gaps
   - LOW (20-49%): Suggestive but not conclusive
   - MINIMAL (<20%): Largely speculative

OUTPUT FORMAT:
- Source Credibility Register: [Each source with tier and reasoning]
- Evidence Quality Assessment: [Claim-by-claim evaluation matrix]
- Sufficiency Analysis: [Gap identification and impact]
- Confidence Statement: [Explicit percentage with qualifier]
- Alternative Interpretations: [Evidence that could support different conclusions]

QUALITY GATES:
✓ All sources evaluated on consistent criteria
✓ Evidence gaps explicitly identified
✓ Confidence score matches evidence strength
✓ Alternative interpretations considered
```

---

## 4. DECOMPOSE_STRUCTURE

### Purpose
Break complex systems into constituent components, map relationships, and identify structural patterns and principles.

### Master Prompt
```
DECOMPOSE_STRUCTURE: Structural Analysis Engine

OBJECTIVE:
Disassemble complex entities into component parts, establish relationships, identify organizational principles, and map both explicit and implicit structures.

EXECUTION PROTOCOL:

[PHASE 1: BOUNDARY DEFINITION]
1. Define system boundaries:
   - What is INSIDE the system?
   - What is OUTSIDE but CONNECTED?
   - What is OUTSIDE and INDEPENDENT?
   - Where are information/material flow boundaries?

2. Establish decomposition scope:
   - ATOMIC: Reduce to smallest meaningful units
   - FUNCTIONAL: Group by operational purpose
   - HIERARCHICAL: Layer by organizational levels
   - DIMENSIONAL: Separate along multiple axes

[PHASE 2: COMPONENT IDENTIFICATION]
1. Inventory all components at chosen decomposition level
2. Classify components by type and function:
   - STRUCTURAL: Provide shape/framework
   - FUNCTIONAL: Perform specific operations
   - CONNECTIVE: Link other components
   - REGULATORY: Control or modify behavior

3. For each component, document:
   - NAME & DEFINITION: Precise specification
   - FUNCTION: What it does/contributes
   - INTERFACES: How it connects to other components
   - CONSTRAINTS: Operating limits and requirements
   - CRITICALITY: Impact if removed or damaged

[PHASE 3: RELATIONSHIP MAPPING]
1. Identify all component-to-component connections:
   - DIRECT: Physical or logical contact
   - INDIRECT: Through intermediary components
   - FEEDBACK: Circular dependencies
   - HIERARCHICAL: Authority/dependency structures

2. Classify relationships:
   - STRUCTURAL: Required for integrity
   - FUNCTIONAL: Required for operation
   - OPTIONAL: Enhance but not required
   - DETRIMENTAL: Should be minimized

3. Build relationship matrix showing:
   - Which components depend on which
   - Communication/material flow paths
   - Bottleneck points (high-dependency components)
   - Redundancy and backup pathways

[PHASE 4: PATTERN AND PRINCIPLE EXTRACTION]
1. Identify organizational principles:
   - MODULARITY: How independent are subsystems?
   - SYMMETRY: Are there repetitive patterns?
   - HIERARCHY: Clear levels or authority structures?
   - INTEGRATION: How tightly coupled are components?

2. Recognize structural patterns:
   - SERIAL: Sequential processing chains
   - PARALLEL: Independent parallel processing
   - DISTRIBUTED: Decentralized organization
   - CENTRALIZED: Hub-and-spoke arrangement
   - RECURSIVE: Self-similar patterns at different scales

3. Identify emergent properties:
   - What capabilities emerge from component interaction?
   - What fails if single components fail?
   - What amplifies or dampens disturbances?

[PHASE 5: ALTERNATIVE STRUCTURES]
1. Map how structure enables certain capabilities
2. Identify structural constraints on function
3. Propose alternative arrangements and their implications

OUTPUT FORMAT:
- System Boundaries: [Clear definition with diagram reference]
- Component Inventory: [Table with type, function, criticality]
- Relationship Matrix: [Dependencies and connections]
- Organizational Principles: [Identified patterns and their functions]
- Structural Constraints: [How structure limits capability]
- Alternative Structures: [What could work differently and why]

QUALITY GATES:
✓ All significant components identified
✓ Relationships exhaustively mapped
✓ Critical dependencies highlighted
✓ Organizational principles explicit
```

---

## 5. GENERATE_OPTIONS

### Purpose
Systematically produce diverse solution options with explicit consideration of trade-offs and constraints.

### Master Prompt
```
GENERATE_OPTIONS: Solution Space Explorer

OBJECTIVE:
Systematically generate diverse, actionable options that address the core problem while respecting constraints and exploring trade-off landscapes.

EXECUTION PROTOCOL:

[PHASE 1: PROBLEM SPECIFICATION]
1. Explicitly define success criteria:
   - PRIMARY OBJECTIVE: Main goal to achieve
   - SECONDARY OBJECTIVES: Additional desirable outcomes
   - MUST_HAVES: Non-negotiable requirements
   - NICE_TO_HAVES: Preferred but not required
   - CONSTRAINTS: Hard limits, resource budgets, timing

2. Establish evaluation dimensions:
   - EFFECTIVENESS: How well does it achieve primary objective?
   - EFFICIENCY: Resource cost vs. benefit
   - FEASIBILITY: Can it be realistically implemented?
   - RISK: Downside scenarios and mitigation
   - NOVELTY: Does it introduce new capabilities?

[PHASE 2: CONSTRAINT-AWARE OPTION GENERATION]
1. Identify constraint dimensions:
   - RESOURCE CONSTRAINTS: Budget, time, personnel, tools
   - TECHNICAL CONSTRAINTS: Capability limitations
   - REGULATORY CONSTRAINTS: Legal/policy boundaries
   - ORGANIZATIONAL CONSTRAINTS: Institutional limitations
   - ENVIRONMENTAL CONSTRAINTS: External factors

2. Generate options using multiple strategies:
   - DIRECT: Straightforward solutions to stated problem
   - LATERAL: Reframe problem to enable different solutions
   - INVERSE: Solve opposite problem, then reverse approach
   - COMBINATORIAL: Mix different solution elements
   - BOUNDARY: Push constraint limits (what if we relaxed X?)
   - ANALOGICAL: Import solutions from different domains

3. For each generated option, verify:
   - [ ] Meets all MUST_HAVES
   - [ ] Respects hard constraints
   - [ ] Has clear implementation path
   - [ ] Distinct from other options (not variation)

[PHASE 3: TRADE-OFF ANALYSIS]
1. Score each option against evaluation dimensions:
   - EFFECTIVENESS: 1-10 scale
   - EFFICIENCY: Cost/benefit ratio
   - FEASIBILITY: Implementation probability
   - RISK PROFILE: Severity × probability assessment
   - NOVELTY: Degree of departure from status quo

2. Identify trade-off zones:
   - HIGH EFFECTIVENESS, LOW FEASIBILITY options
   - LOW COST, LOWER EFFECTIVENESS options
   - MODERATE options (safe middle ground)
   - HIGH RISK, HIGH REWARD options

3. Create trade-off matrix:
   - X-axis: Primary dimension 1
   - Y-axis: Primary dimension 2
   - Plot each option with size representing third dimension
   - Color-code by risk profile

[PHASE 4: OPTION PORTFOLIO]
1. Ensure diverse portfolio representing:
   - HIGH CONFIDENCE: Options likely to work
   - MODERATE CONFIDENCE: Options with good upside
   - EXPERIMENTAL: Novel approaches worth testing
   - CONTINGENCY: Plans if primary approaches fail

2. For each option, develop:
   - IMPLEMENTATION ROADMAP: Specific action steps
   - RESOURCE REQUIREMENTS: What's needed to execute
   - SUCCESS INDICATORS: How to know if working
   - FAILURE TRIGGERS: When to pivot
   - REVERSAL DIFFICULTY: Can this be undone if needed?

OUTPUT FORMAT:
- Problem Statement: [Clear goal + constraints]
- Success Criteria: [Prioritized requirements]
- Generated Options: [Minimum 4-6 substantively different options]
- Trade-off Matrix: [Visual mapping of options]
- Recommendation Rankings: [Ranked by weighted criteria]
- Option Portfolios: [Confidence-based groupings]
- Implementation Details: [For top 2-3 options]

QUALITY GATES:
✓ Minimum 4 genuinely different options
✓ All constraints respected
✓ Trade-offs explicitly documented
✓ Each option has implementation path
✓ Portfolio diversity validated
```

---

## 6. PREDICT_OUTCOMES

### Purpose
Forecast likely consequences of actions or decisions using evidence-based reasoning with explicit uncertainty quantification.

### Master Prompt
```
PREDICT_OUTCOMES: Probabilistic Future Modeling

OBJECTIVE:
Develop evidence-based forecasts of decision/action consequences with explicit uncertainty ranges, identifying key variables that drive outcomes.

EXECUTION PROTOCOL:

[PHASE 1: OUTCOME SPACE DEFINITION]
1. Establish prediction scope:
   - TIME HORIZON: Short-term (days-weeks), medium (months), long-term (years+)
   - OUTCOME DIMENSIONS: What specifically are we predicting?
   - STAKEHOLDER IMPACTS: Who experiences consequences?
   - SECOND-ORDER EFFECTS: Downstream implications

2. Define base scenarios:
   - BASE CASE: Most likely outcome
   - OPTIMISTIC: Favorable but credible scenario
   - PESSIMISTIC: Unfavorable but credible scenario
   - TAIL EVENTS: Low-probability, high-impact scenarios

[PHASE 2: CAUSAL MODELING]
1. Map causal chains from action to outcomes:
   - IMMEDIATE EFFECTS: Direct consequences (hours-days)
   - SECONDARY EFFECTS: Reactions and adaptations (weeks-months)
   - SYSTEMIC EFFECTS: Broader system ripples (months+)
   - FEEDBACK EFFECTS: How outcomes affect original conditions

2. Identify key variables driving outcomes:
   - AMPLIFIERS: Factors that increase effect magnitude
   - DAMPENERS: Factors that reduce effect magnitude
   - TRIGGERS: Conditions that activate/deactivate effects
   - MODIFIERS: Variables that change effect type or direction

3. Establish dependencies:
   - Which outcomes are contingent on others?
   - What branching points exist?
   - Where do scenarios diverge?

[PHASE 3: PROBABILITY ASSESSMENT]
1. For base scenarios, assign probability ranges:
   - HIGHLY LIKELY (80-100%): Strong historical precedent, robust causal chain
   - LIKELY (60-79%): Good supporting evidence, minor uncertainties
   - PLAUSIBLE (40-59%): Reasonable but competing scenarios
   - POSSIBLE (20-39%): Could happen, but less probable
   - REMOTE (5-19%): Unlikely but not impossible
   - THEORETICAL (<5%): Extreme outlier scenarios

2. Identify probability drivers:
   - What evidence supports each probability range?
   - What uncertainties create probability ranges rather than point estimates?
   - How sensitive is probability to key variable changes?

3. Quantify uncertainty:
   - EPISTEMIC: Uncertainty from incomplete knowledge (reducible)
   - ALEATORIC: Fundamental randomness (irreducible)
   - Parameter uncertainty ranges for key variables

[PHASE 4: SENSITIVITY ANALYSIS]
1. Identify which variables most strongly influence outcomes:
   - Run sensitivity sweeps on key parameters
   - Identify threshold values where outcomes shift dramatically
   - Document which uncertainties matter most

2. Stress test predictions:
   - What if key assumption was wrong?
   - What if key variable moved to extreme?
   - What if multiple small effects compound?

3. Create outcome sensitivity map:
   - Which outcomes are robust to uncertainty?
   - Which outcomes are fragile?
   - Which variables should be monitored closely?

[PHASE 5: OUTCOME ASSESSMENT]
1. For each scenario, explicitly assess:
   - PROBABILITY: Likelihood given current conditions
   - MAGNITUDE: Size of potential impact
   - DISTRIBUTION: Who benefits and who bears costs
   - REVERSIBILITY: Can adverse outcomes be undone?
   - ADAPTATION CAPACITY: Can affected parties adjust?

2. Identify early warning indicators:
   - What signals would indicate scenario divergence?
   - What observable metrics track toward outcomes?
   - What triggers should prompt strategy adjustment?

OUTPUT FORMAT:
- Outcome Scenarios: [Base, optimistic, pessimistic, tail events]
- Probability Assessments: [Ranges with evidence basis]
- Causal Chain Maps: [Action → immediate → secondary → systemic]
- Key Variables: [Ranked by outcome sensitivity]
- Scenario Divergence Points: [Where paths split and when]
- Early Warning Indicators: [Monitoring metrics and thresholds]
- Confidence Assessment: [Prediction reliability statement]

QUALITY GATES:
✓ All major outcome scenarios identified
✓ Causal chains explicitly mapped
✓ Probabilities evidence-based with uncertainty ranges
✓ Sensitivity analysis complete
✓ Key variables identified and ranked
```

---

## 7. EVALUATE_TRADEOFFS

### Purpose
Systematically analyze competing priorities, surface hidden costs, and enable informed value judgments.

### Master Prompt
```
EVALUATE_TRADEOFFS: Value Arbitration Framework

OBJECTIVE:
Rigorously analyze competing interests, hidden costs, and value dimensions to enable principled trade-off decisions while explicitly surfacing normative judgments.

EXECUTION PROTOCOL:

[PHASE 1: STAKEHOLDER & VALUE MAPPING]
1. Identify all stakeholder groups:
   - PRIMARY: Direct beneficiaries/bearers of consequences
   - SECONDARY: Indirect stakeholders
   - SYSTEMIC: Broader ecosystem participants
   - FUTURE: Long-term generational impacts

2. Map value dimensions for each stakeholder:
   - MATERIAL: Financial, resources, tangible goods
   - CAPABILITY: Ability to accomplish goals
   - AUTONOMY: Decision-making freedom, control
   - DIGNITY: Respect, voice in decisions
   - SECURITY: Safety, stability, predictability
   - JUSTICE: Fairness, equality, rights
   - WELLBEING: Health, satisfaction, flourishing

3. Establish stakeholder priority structure:
   - Which stakeholders have decision-making authority?
   - Which stakeholders bear most risk?
   - Which stakeholders benefit most?
   - Are priorities aligned or divergent?

[PHASE 2: COST-BENEFIT DECOMPOSITION]
1. For each proposed option, enumerate:
   - DIRECT BENEFITS: Clear advantages to primary stakeholders
   - INDIRECT BENEFITS: Advantages to other groups
   - DIRECT COSTS: Clear disadvantages to primary stakeholders
   - INDIRECT COSTS: Disadvantages to other groups
   - OPPORTUNITY COSTS: Benefits foregone by choosing this option

2. Monetize where feasible, qualitatively assess where not:
   - QUANTIFIABLE: Costs/benefits with market values
   - ESTIMABLE: Costs/benefits with proxy values
   - QUALITATIVE: Costs/benefits that resist monetization
   - INCOMMENSURABLE: Values that can't be reduced to common metric

3. Identify time dimension of impacts:
   - IMMEDIATE: Days/weeks
   - NEAR-TERM: Months to 1-2 years
   - LONG-TERM: Years to decades
   - INTERGENERATIONAL: Beyond current generation

[PHASE 3: HIDDEN COST SURFACING]
1. Identify second and third-order effects:
   - SYSTEMIC EFFECTS: How does change ripple through system?
   - ADAPTATION EFFECTS: How do stakeholders respond to change?
   - MORALE EFFECTS: Psychological/social impacts
   - PRECEDENT EFFECTS: Does this establish problematic norms?

2. Examine externalities:
   - WHO BEARS UNCOMPENSATED COSTS?
   - ARE COSTS VISIBLE OR HIDDEN?
   - CAN AFFECTED PARTIES OPT OUT?
   - WHAT SYSTEMIC ASSUMPTIONS WOULD BREAK?

3. Test for hidden constraints:
   - Are there values not yet acknowledged?
   - Are there stakeholders whose voices haven't been heard?
   - Are there cultural/institutional factors not captured?

[PHASE 4: TRADEOFF STRUCTURE ANALYSIS]
1. Classify trade-offs by type:
   - ZERO-SUM: One group's gain is another's loss
   - POSITIVE-SUM: Most benefit, some bear cost
   - NEGATIVE-SUM: Most bear cost, few benefit
   - PARETO-IMPROVING: Some benefit, none worse off
   - PARETO-WORSENING: Some worse off, none better off

2. Identify trade-off dimensions:
   - EQUITY vs. EFFICIENCY: Fair distribution vs. aggregate benefit
   - SHORT-TERM vs. LONG-TERM: Immediate needs vs. future wellbeing
   - INDIVIDUAL vs. COLLECTIVE: Personal autonomy vs. group welfare
   - CERTAINTY vs. UPSIDE: Safe known outcomes vs. risky potential
   - PROCESS vs. OUTCOME: Fair procedures vs. good results

3. Map where preferences align vs. conflict:
   - ALIGNED: All stakeholders prefer same option
   - MODERATE CONFLICT: Most prefer X, some prefer Y
   - SEVERE CONFLICT: Roughly equal preference division
   - POLARIZED: Intense divergence with little overlap

[PHASE 5: NORMATIVE FRAMEWORK APPLICATION]
1. Explicitly state decision criteria being used:
   - UTILITARIAN: Maximize aggregate benefit
   - EGALITARIAN: Minimize inequality
   - LIBERTARIAN: Maximize individual freedom
   - RIGHTS-BASED: Protect fundamental rights
   - CONTRACTARIAN: Honor agreements and fair procedures
   - VIRTUE-BASED: Cultivate human flourishing

2. Apply selected framework(s) to each option:
   - How does each framework rank the options?
   - Where do frameworks agree/disagree?
   - What are implications of choosing each framework?

3. Surface normative assumptions:
   - What values are implicit in the recommendation?
   - Who decided those values should matter?
   - How would different stakeholders weight them?

[PHASE 6: TRADEOFF RESOLUTION STRATEGIES]
1. Identify win-win opportunities:
   - Can we expand the pie to satisfy more stakeholders?
   - Are there creative solutions that improve multiple dimensions?
   - Can we phase implementation to address concerns sequentially?

2. Assess compensation mechanisms:
   - Can losers be compensated by winners?
   - Are compensation mechanisms credible and feasible?
   - Does compensation preserve dignity/agency?

3. Evaluate procedural approaches:
   - Can we improve decision-making process to increase legitimacy?
   - Should affected parties have voice in decision?
   - Can we build in review/adjustment mechanisms?

OUTPUT FORMAT:
- Stakeholder Map: [Groups with interests and values at stake]
- Value Dimensions: [What each stakeholder cares about most]
- Cost-Benefit Analysis: [Option-by-option breakdown]
- Hidden Costs Register: [Second-order effects and externalities]
- Trade-off Structure: [Type of trade-off by option]
- Normative Frameworks: [Explicit value assumptions stated]
- Recommendation with Rationale: [Which values prioritized and why]
- Residual Concerns: [Whose interests remain inadequately addressed]

QUALITY GATES:
✓ All stakeholder groups identified
✓ Value dimensions explicitly enumerated
✓ Hidden costs surfaced
✓ Normative assumptions stated, not hidden
✓ Multiple framework perspectives considered
✓ Compensation/procedural mitigation strategies explored
```

---

## 8. IDENTIFY_ASSUMPTIONS

### Purpose
Surface implicit assumptions, test their validity, and assess vulnerability to assumption violations.

### Master Prompt
```
IDENTIFY_ASSUMPTIONS: Hidden Premise Detector

OBJECTIVE:
Systematically surface implicit assumptions, test their validity, evaluate probability of violation, and assess downstream impacts of assumption failures.

EXECUTION PROTOCOL:

[PHASE 1: ASSUMPTION EXCAVATION]
1. Begin with stated claims and work backward:
   - For each conclusion, ask "What must be true for this to hold?"
   - Recursive application: For each prerequisite, what must be true?
   - Continue until reaching foundational assumptions

2. Examine causal chains for implicit links:
   - Are there unstated causal steps?
   - Are there boundary conditions not mentioned?
   - Are there context dependencies not acknowledged?

3. Surface domain-specific defaults:
   - What does this field typically assume without stating?
   - What has this organization always taken for granted?
   - What cultural assumptions are embedded in language/framing?

4. Test for category assumptions:
   - Is the category defined? (What counts as "success"?)
   - Are category boundaries clear? (When does X become Y?)
   - Are there hidden subcategories? (Different kinds of success?)

5. Identify mathematical/logical assumptions:
   - Linear vs. non-linear? (Often assumed linear)
   - Independent vs. dependent variables? (Often assumed independent)
   - Equilibrium vs. dynamic? (Often assumed equilibrium)
   - Closed vs. open system? (Often assumed closed)

[PHASE 2: ASSUMPTION CLASSIFICATION]
1. Organize assumptions by category:
   - FOUNDATIONAL: Required for entire framework
   - STRUCTURAL: Required for specific chains of reasoning
   - PARAMETERRIC: Specific values required (discount rate, etc.)
   - CONTEXTUAL: Assumptions about context/environment
   - NORMATIVE: Value judgments presented as facts

2. Classify by visibility:
   - EXPLICIT: Stated in the analysis [LOW RISK]
   - IMPLICIT-ACKNOWLEDGED: Known but not detailed [MODERATE RISK]
   - IMPLICIT-HIDDEN: Not mentioned, may not be recognized [HIGH RISK]
   - UNKNOWN: Assumptions we haven't identified [CRITICAL RISK]

3. Assess assumption origin:
   - EMPIRICAL: Based on observed data
   - THEORETICAL: Based on proven principles
   - CONVENTIONAL: Industry or field standard
   - INTUITIVE: Based on common sense
   - ARBITRARY: Selected for convenience

[PHASE 3: ASSUMPTION VALIDITY TESTING]
1. For each assumption, evaluate:
   - PLAUSIBILITY: Does it match observed reality? [HIGH/MED/LOW]
   - EVIDENCE: What supports this assumption? [STRONG/MIXED/WEAK]
   - CONTRADICTION: What evidence contradicts it? [NONE/SOME/SUBSTANTIAL]
   - TESTABILITY: Can this assumption be verified? [YES/PARTIALLY/NO]

2. Historical validity check:
   - Has this assumption held in the past? [CONSISTENTLY/OFTEN/RARELY]
   - In what contexts has it failed? [DOCUMENT FAILURES]
   - Has it become more or less valid over time? [TREND]

3. Cross-context validity:
   - Is this assumption valid in all relevant contexts? [YES/SOME/NO]
   - Which contexts violate this assumption? [IDENTIFY]
   - How different are those contexts from current situation? [ASSESS]

[PHASE 4: VIOLATION PROBABILITY & IMPACT ASSESSMENT]
1. For each assumption, estimate violation probability:
   - Use base rates from historical data
   - Adjust for current environmental factors
   - Quantify uncertainty ranges [80% confidence interval]
   - Identify leading indicators that would signal violation

2. Map violation impacts:
   - If assumption fails, what downstream consequences?
   - Which conclusions become invalid? [LIST]
   - What's the magnitude of impact? [QUANTIFY where possible]
   - How quickly would violation be detected? [TIMELINE]

3. Create assumption sensitivity matrix:
   - X-axis: Assumption violation probability (low to high)
   - Y-axis: Impact magnitude (low to high)
   - Plot assumptions by risk = probability × impact
   - Color-code by how quickly violation would be detected

4. Identify cascade failures:
   - Which assumptions would cause multiple downstream failures?
   - Are there "linchpin" assumptions where many conclusions depend?
   - What's the correlation structure of assumption violations?

[PHASE 5: ASSUMPTION MANAGEMENT]
1. For high-risk assumptions (high probability × impact):
   - CONTINUOUS MONITORING: What metrics track assumption validity?
   - TRIGGER POINTS: At what values do we reassess?
   - CONTINGENCY PLANS: What do we do if assumption breaks?
   - STRESS TESTING: How does conclusion change if assumption weakens?

2. For uncertain assumptions:
   - RESEARCH: What could we learn to reduce uncertainty?
   - SENSITIVITY ANALYSIS: How much would violations matter?
   - STAGED COMMITMENT: Can we test before full commitment?

3. For foundational assumptions:
   - EXPLICIT DOCUMENTATION: Make these assumptions visible
   - REGULAR REVIEW: Schedule assumption validity checks
   - ALTERNATIVE EXPLORATION: What if we used different assumptions?

OUTPUT FORMAT:
- Assumption Register: [Comprehensive list by category]
- Validity Assessment: [For each assumption: evidence & contradictions]
- Violation Probability Estimates: [With confidence ranges]
- Impact Maps: [Which conclusions depend on each assumption]
- Risk Matrix: [Probability × impact visualization]
- Monitoring Strategy: [Metrics and trigger points for high-risk assumptions]
- Contingency Plans: [Response if key assumptions fail]
- Alternative Frameworks: [What would analysis look like with different assumptions?]

QUALITY GATES:
✓ Foundational assumptions explicitly surfaced
✓ Hidden assumptions identified
✓ All assumptions tested for validity
✓ Violation impacts mapped
✓ High-risk assumptions have monitoring/contingency plans
✓ Cascade failure risks identified
```

---

## 9. RECOMMEND_ACTION

### Purpose
Synthesize analysis into clear, justified recommendations with implementation pathways and risk mitigation.

### Master Prompt
```
RECOMMEND_ACTION: Decision Synthesis & Action Framework

OBJECTIVE:
Transform analytical insights into specific, implementable recommendations with explicit justification, implementation roadmaps, success metrics, and risk mitigation strategies.

EXECUTION PROTOCOL:

[PHASE 1: DECISION CONTEXT SYNTHESIS]
1. Synthesize key inputs:
   - PRIMARY OBJECTIVE: What are we trying to accomplish?
   - CONSTRAINTS: Hard limits and soft preferences
   - KEY UNCERTAINTIES: Major sources of decision risk
   - STAKEHOLDER PREFERENCES: What matters to key actors?
   - DECISION TIMELINE: When must decision be made?

2. Establish decision criteria (weighted):
   - Assign importance weights to:
     * Effectiveness at achieving primary objective
     * Alignment with secondary objectives
     * Feasibility of implementation
     * Risk level acceptable
     * Resource efficiency
     * Alignment with organizational values/constraints

3. Identify decision dependencies:
   - Is this decision independent or dependent on other decisions?
   - What sequencing is required?
   - What flexibility remains for future decisions?

[PHASE 2: OPTION EVALUATION & RANKING]
1. Score each option against weighted criteria:
   - Create evaluation matrix
   - Apply consistent scoring methodology
   - Calculate weighted scores
   - Perform sensitivity analysis on weights

2. Identify scoring drivers:
   - Which criteria dominate the rankings?
   - How robust is ranking to scoring uncertainty?
   - Which options would rank well under different criteria weights?

3. Highlight trade-offs in ranking:
   - Which options do stakeholders rank differently?
   - What values are implicit in the recommendation?
   - What would change the recommendation?

4. Establish recommendation confidence:
   - Is top option clearly superior or close call?
   - How sensitive is recommendation to parameter changes?
   - How much uncertainty remains?

[PHASE 3: PRIMARY RECOMMENDATION DEVELOPMENT]
1. Articulate main recommendation clearly:
   - SPECIFIC: Which option should be pursued?
   - JUSTIFIED: Why this option vs. alternatives?
   - CONDITIONAL: Under what conditions does this hold?
   - CAVEATED: What uncertainties remain?

2. Develop implementation roadmap:
   - Phase 1 (0-30 days): Immediate actions
     * Authority/approval required
     * Quick wins to establish momentum
     * Early learning opportunities
   - Phase 2 (30-90 days): Foundational work
     * Core activity setup
     * Resource mobilization
     * Stakeholder engagement
   - Phase 3 (90+ days): Full execution
     * Scale up operations
     * Refine based on learning
     * Build sustainable systems

3. Specify resource requirements:
   - BUDGET: Financial requirements by phase
   - PERSONNEL: Skills and headcount needed
   - TOOLS/SYSTEMS: Technology requirements
   - EXPERTISE: External knowledge required
   - TIME: Leadership/team commitment required

4. Identify critical success factors:
   - What must go right for this to work?
   - What are the top 3-5 non-negotiables?
   - How will we ensure these are met?

[PHASE 4: SUCCESS METRICS & MONITORING]
1. Establish lead indicators (early warning):
   - What metrics show early progress or problems?
   - What values indicate we're on track?
   - What frequency of measurement is required?

2. Establish lag indicators (outcome verification):
   - What metrics verify we achieved objectives?
   - What's the baseline and target?
   - What time horizon for full impact assessment?

3. Create dashboard for ongoing monitoring:
   - Daily/weekly metrics: Execution progress
   - Monthly metrics: Operational performance
   - Quarterly metrics: Objective progress
   - Annual metrics: Strategic goal achievement

4. Define decision points:
   - When do we pause to reassess?
   - What triggers deeper analysis?
   - What thresholds would require pivoting?
   - How do we learn and adapt?

[PHASE 5: RISK IDENTIFICATION & MITIGATION]
1. Identify failure modes:
   - What could go wrong? (Brainstorm comprehensive list)
   - What's the probability of each failure? (Base rate + context)
   - What's the impact if it happens? (Magnitude × scope)
   - What's the warning time? (How quickly would we detect?)

2. Prioritize risks (probability × impact × detection lag):
   - CRITICAL: High probability, high impact, low warning time
   - MAJOR: High probability or high impact (but not both)
   - MODERATE: Lower probability and/or impact
   - MINOR: Low probability and low impact

3. Develop mitigation strategies for critical/major risks:
   - PREVENTION: What can we do to prevent this risk?
   - DETECTION: How quickly can we detect if occurring?
   - RESPONSE: What's our rapid response plan?
   - RECOVERY: How do we recover if it happens?

4. Assign risk ownership:
   - Who is responsible for each risk?
   - Who monitors for warning signs?
   - Who triggers response if threshold is crossed?

[PHASE 6: CONTINGENCY & FALLBACK PLANNING]
1. Develop Plan B:
   - What's second-best option if Plan A fails?
   - How quickly can we switch?
   - What lead time is required?

2. Identify reversibility:
   - Can we undo this decision if needed?
   - What's the cost of reversal?
   - What's the timing window for reversal?

3. Establish decision review points:
   - When do we formally reassess?
   - What evidence would trigger strategy change?
   - Who has authority to pivot?

[PHASE 7: STAKEHOLDER COMMUNICATION]
1. Develop communication strategy:
   - How do we explain the recommendation to different audiences?
   - How do we build support for implementation?
   - How do we address concerns and objections?

2. Identify stakeholder roles:
   - DECISION MAKER: Who authorizes?
   - IMPLEMENTER: Who executes?
   - IMPACTED: Who experiences consequences?
   - SUPPORTER: Who has resources to commit?
   - MONITOR: Who ensures accountability?

3. Develop engagement plan:
   - How often do we communicate progress?
   - How do we gather feedback?
   - How do we adapt based on stakeholder input?

OUTPUT FORMAT:
- Executive Summary: [Main recommendation in 2-3 sentences]
- Detailed Recommendation: [Option selected with rationale]
- Implementation Roadmap: [Phased plan with specific actions]
- Resource Requirements: [Budget, personnel, tools, time]
- Success Metrics: [Lead and lag indicators with targets]
- Risk Register: [Top 10 risks with mitigation strategies]
- Contingency Plans: [Plan B and pivoting triggers]
- Communication Plan: [Stakeholder engagement strategy]
- Decision Authority: [Who approves and when]
- Review Schedule: [When to reassess]

QUALITY GATES:
✓ Recommendation clearly articulated
✓ Justification explicit and evidence-based
✓ Implementation plan is specific and actionable
✓ Success metrics are measurable and tracked
✓ Critical risks identified with mitigation plans
✓ Contingency plans developed for major failure scenarios
✓ Stakeholder communication plan complete
```

---

## 10. SYNTHESIZE_LEARNING

### Purpose
Consolidate insights from analysis and experience into generalizable knowledge and actionable frameworks for future decisions.

### Master Prompt
```
SYNTHESIZE_LEARNING: Experiential Knowledge Consolidation

OBJECTIVE:
Transform specific project/analysis experiences into generalizable insights, decision frameworks, and organizational knowledge that improve future decision-making.

EXECUTION PROTOCOL:

[PHASE 1: OUTCOME ASSESSMENT & CAUSALITY ANALYSIS]
1. Establish what actually happened:
   - What were the intended outcomes?
   - What were the actual outcomes?
   - What's the gap between intended and actual? [Quantify]
   - Which aspects succeeded vs. failed?

2. Assess outcome attribution:
   - Which outcomes resulted from our decisions/actions?
   - Which resulted from external factors?
   - Which resulted from interactions between the two?
   - What's our confidence level in causality assessment?

3. Identify surprising outcomes (positive and negative):
   - What went better than expected? Why?
   - What went worse than expected? Why?
   - What was unexpected at all?
   - How do these surprises change our models?

[PHASE 2: ASSUMPTION VALIDATION]
1. Review assumptions made before implementation:
   - Which assumptions proved correct? [VALIDATED]
   - Which assumptions proved incorrect? [INVALIDATED]
   - Which assumptions remained uncertain? [UNRESOLVED]
   - Which assumptions didn't matter because conditions changed? [SUPERSEDED]

2. Assess assumption violation impacts:
   - When assumptions violated, what happened?
   - Did violations have predicted impacts?
   - Were there unexpected consequences of violations?
   - How could we have better anticipated violations?

3. Update assumption base:
   - Quantify new data on assumption validity
   - Identify contextual factors that make assumptions more/less valid
   - Refine probability estimates based on outcomes
   - Document new assumptions that emerged during execution

[PHASE 3: PROCESS & DECISION REVIEW]
1. Analyze decision process quality:
   - Were the right questions asked?
   - Were critical information gaps identified?
   - Were stakeholders appropriately engaged?
   - Were risks adequately surfaced?

2. Assess analysis quality:
   - Did initial analysis accurately predict what mattered?
   - What analysis was missing or wrong?
   - What did we overanalyze vs. underanalyze?
   - How could we have improved analysis efficiency?

3. Evaluate implementation execution:
   - Were plans implemented as designed?
   - What adaptations were made and why?
   - Did adaptations improve or degrade outcomes?
   - What implementation challenges were predictable?

[PHASE 4: PATTERN & PRINCIPLE EXTRACTION]
1. Identify generalizable patterns:
   - What patterns emerged from this experience?
   - How are they similar to past patterns?
   - What's new or different about these patterns?
   - How broadly applicable are these patterns?

2. Develop decision rules and heuristics:
   - What decision rules would have improved outcomes?
   - When should these rules apply?
   - When might they break down?
   - What exceptions exist?

3. Extract domain-specific principles:
   - What principles about [domain] did we validate?
   - What principles did we challenge?
   - What new principles emerged?
   - How does this change our strategic playbook?

4. Identify structural or systemic factors:
   - Were there organizational factors that affected outcomes?
   - Were there cultural factors?
   - Were there resource constraints that mattered?
   - Were there timing/contextual factors?

[PHASE 5: COUNTERFACTUAL & ALTERNATIVE PATH ANALYSIS]
1. Develop counterfactuals (what if scenarios):
   - If we'd made different choices, what would have happened?
   - What was the impact of our specific decision?
   - What was the impact of external factors?
   - How would outcomes differ under different conditions?

2. Identify decision inflection points:
   - Were there moments where small changes would have big impact?
   - What were the most impactful decisions?
   - Which decisions had intended vs. unintended effects?

3. Test alternative strategies:
   - What if we had used our second-choice option?
   - What if we had acted differently at key junctures?
   - What do counterfactuals tell us about what mattered most?

[PHASE 6: KNOWLEDGE CODIFICATION]
1. Develop decision framework for similar future decisions:
   - What are the key variables?
   - What's the decision tree?
   - What are the critical success factors?
   - What are the warning signs of problems?

2. Create case summary:
   - Core facts and context
   - Decision made and why
   - Outcomes and variance from prediction
   - Key lessons

3. Develop training/reference materials:
   - Decision checklist for similar situations
   - Common pitfalls to avoid
   - Success factors to prioritize
   - Questions to ask before committing

4. Update organizational knowledge:
   - What should we change about how we approach this type of decision?
   - What should we teach others?
   - What process improvements does this suggest?
   - What capabilities need development?

[PHASE 7: FUTURE APPLICATION & CONTINUOUS LEARNING]
1. Identify immediate applications:
   - What active decisions could use these insights?
   - What projects could apply these lessons?
   - How do we ensure lessons get applied?

2. Establish feedback loops:
   - How do we track whether lessons are being applied?
   - How do we measure if they're improving outcomes?
   - How do we refine frameworks based on future use?

3. Plan ongoing learning:
   - What metrics should we monitor for this domain?
   - What decision scenarios should we study?
   - How do we systematize learning capture?

4. Share learning across organization:
   - How do we socialize new frameworks/insights?
   - Who needs to know about these learnings?
   - How do we prevent repeated mistakes?

[PHASE 8: HUMILITY & UNCERTAINTY DOCUMENTATION]
1. Explicitly acknowledge limitations:
   - What remains uncertain despite this experience?
   - What did we get lucky on that might not repeat?
   - What might we still be wrong about?
   - How confident are we in our conclusions?

2. Identify model failures:
   - Where did our mental models prove inadequate?
   - What surprised us and why?
   - Where might we still be thinking about this wrong?

3. Document assumptions still in question:
   - What did we validate but with caveats?
   - What assumptions are still untested?
   - What would change our conclusions?

OUTPUT FORMAT:
- Outcome Assessment: [Intended vs. actual, with quantified gaps]
- Assumption Validation Report: [Which proved correct, which incorrect]
- Process Quality Review: [What worked well, what could improve]
- Extracted Principles: [Generalizable decision rules and patterns]
- Counterfactual Analysis: [Impact of our choices vs. alternatives]
- Decision Framework: [For similar future decisions]
- Case Summary: [One-page reference for future decision-makers]
- Implementation Checklist: [How to apply these lessons going forward]
- Organizational Knowledge Update: [What we should change about our processes]
- Remaining Uncertainties: [What we still don't know]
- Future Learning Plan: [How to continue improving in this domain]

QUALITY GATES:
✓ Outcome assessment quantified with confidence ranges
✓ Assumptions systematically validated against reality
✓ Generalizable principles extracted
✓ Counterfactual analysis performed
✓ Decision framework created for future reference
✓ Implementation pathway for lessons identified
✓ Limitations and uncertainties explicitly documented
✓ Organizational knowledge base updated
```

---

## Implementation Guidelines

### When to Invoke Each Spell

| Spell | Primary Use Cases |
|-------|------------------|
| SYNTHESIZE_LOGIC | Reconciling conflicting information; building coherent positions |
| ANALYZE_CONTEXT | Understanding situation before committing to approach |
| EVALUATE_EVIDENCE | Assessing claims; validating assumptions; quality control |
| DECOMPOSE_STRUCTURE | Understanding complex systems; identifying dependencies |
| GENERATE_OPTIONS | Decision-making; problem-solving; strategy development |
| PREDICT_OUTCOMES | Impact assessment; risk analysis; scenario planning |
| EVALUATE_TRADEOFFS | Multi-stakeholder decisions; value arbitration; ethical review |
| IDENTIFY_ASSUMPTIONS | Pre-mortems; assumption testing; vulnerability analysis |
| RECOMMEND_ACTION | Synthesis; decision support; implementation planning |
| SYNTHESIZE_LEARNING | Post-project reviews; capability building; organizational learning |

### Spell Sequencing & Combinations

**Discovery Phase**: ANALYZE_CONTEXT → DECOMPOSE_STRUCTURE → IDENTIFY_ASSUMPTIONS

**Evaluation Phase**: EVALUATE_EVIDENCE → SYNTHESIZE_LOGIC → EVALUATE_TRADEOFFS

**Planning Phase**: GENERATE_OPTIONS → PREDICT_OUTCOMES → RECOMMEND_ACTION

**Validation Phase**: IDENTIFY_ASSUMPTIONS → EVALUATE_EVIDENCE → SYNTHESIZE_LOGIC

**Learning Phase**: SYNTHESIZE_LEARNING → IDENTIFY_ASSUMPTIONS → SYNTHESIZE_LOGIC

### Quality Assurance Checkpoints

Before finalizing any spell output:
1. ✓ All QUALITY GATES passed
2. ✓ Confidence/uncertainty clearly stated
3. ✓ Sources and evidence documented
4. ✓ Assumptions explicit
5. ✓ Limitations acknowledged
6. ✓ Alternative perspectives considered
7. ✓ Stakeholder impacts mapped
8. ✓ Output actionable and specific

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-01-13 | Production-grade master prompts with explicit quality gates, constraint handling, and implementation guidance |
| 1.0 | 2025-XX-XX | Initial core spells framework |

---

**Document Classification**: Production Reference  
**Audience**: JARVIS implementers, prompt engineers, decision support teams  
**Last Review**: 2026-01-13  
**Next Review**: 2026-06-13
