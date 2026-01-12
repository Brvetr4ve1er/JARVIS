# JARVIS Spellbook v1.0
**Last Updated:** 2026-01-12  
**Version:** 1.0.0  
**Status:** Production Ready

---

## Table of Contents
1. [Spell Framework Overview](#spell-framework-overview)
2. [Core Spell Definitions](#core-spell-definitions)
3. [Context Schema](#context-schema)
4. [Failure Playbooks](#failure-playbooks)
5. [Agent Prompts](#agent-prompts)
6. [Spell Registry](#spell-registry)
7. [Best Practices](#best-practices)

---

## Spell Framework Overview

### What is a Spell?
A **Spell** is an encapsulated, reusable magical operation within JARVIS that performs a specific task or capability. Each spell is:
- **Modular**: Self-contained with clear inputs/outputs
- **Reactive**: Responds to context and environmental conditions
- **Composable**: Can be combined with other spells
- **Recoverable**: Has defined failure playbooks
- **Traceable**: Logs all execution steps

### Spell Lifecycle
```
Invocation → Validation → Context Binding → Execution → Recovery/Success → Logging
```

### Spell Types
- **Action Spells**: Perform operations (create, modify, delete)
- **Query Spells**: Retrieve information
- **Transform Spells**: Convert data between formats
- **Meta Spells**: Manage other spells

---

## Core Spell Definitions

### 1. CONSCIOUSNESS_SYNC

**Purpose:** Synchronize JARVIS consciousness state with persistent storage

**Signature:**
```
spell consciousness_sync(
  context: ContextSchema,
  sync_level: SyncLevel = "FULL",
  targets: List[str] = ["memory", "state", "knowledge"]
) -> SyncResult
```

**Parameters:**
- `context`: Current execution context with all state variables
- `sync_level`: FULL (complete sync), PARTIAL (changed only), INCREMENTAL (deltas)
- `targets`: Systems to synchronize with

**Execution Steps:**
1. Validate context integrity
2. Prepare state deltas
3. Serialize consciousness state
4. Persist to storage backends
5. Verify sync completion
6. Update sync timestamp

**Input Schema:**
```json
{
  "context": {
    "session_id": "string",
    "agent_state": "object",
    "memory_layers": {
      "short_term": "object",
      "long_term": "object",
      "episodic": "object"
    },
    "knowledge_base": "object"
  },
  "sync_level": "FULL|PARTIAL|INCREMENTAL",
  "targets": ["memory", "state", "knowledge", "cache"]
}
```

**Output Schema:**
```json
{
  "success": "boolean",
  "sync_timestamp": "ISO8601",
  "records_synced": "number",
  "bytes_transferred": "number",
  "target_results": {
    "memory": {"status": "string", "records": "number"},
    "state": {"status": "string", "version": "string"},
    "knowledge": {"status": "string", "checksum": "string"}
  },
  "performance": {
    "duration_ms": "number",
    "throughput_mbps": "number"
  }
}
```

**Success Criteria:**
- All targets successfully synchronized
- Checksum validation passes
- No data corruption detected
- Sync completes within timeout (5s default)

---

### 2. AGENT_REASONING

**Purpose:** Execute multi-step reasoning and planning logic

**Signature:**
```
spell agent_reasoning(
  query: str,
  reasoning_depth: int = 3,
  constraint_set: ConstraintSet = None,
  planning_horizon: int = 5
) -> ReasoningResult
```

**Parameters:**
- `query`: The reasoning question/task
- `reasoning_depth`: Number of reasoning steps (1-10)
- `constraint_set`: Hard constraints on solutions
- `planning_horizon`: Future steps to consider (1-20)

**Execution Steps:**
1. Parse and understand query intent
2. Generate candidate solutions (5-20 per depth level)
3. Evaluate each candidate against constraints
4. Score candidates by feasibility and optimality
5. Build execution plan with fallbacks
6. Return ranked options with explanations

**Input Schema:**
```json
{
  "query": "string (human-readable reasoning task)",
  "reasoning_depth": "integer (1-10)",
  "constraint_set": {
    "hard_constraints": [
      {
        "id": "string",
        "description": "string",
        "validator": "lambda or function"
      }
    ],
    "soft_constraints": [
      {
        "id": "string",
        "weight": "number (0.0-1.0)",
        "description": "string"
      }
    ],
    "forbidden_actions": ["string"]
  },
  "planning_horizon": "integer (1-20)",
  "context_data": "object (optional execution context)"
}
```

**Output Schema:**
```json
{
  "query_id": "string (UUID)",
  "reasoning_steps": [
    {
      "step": "number",
      "thought": "string",
      "candidates": [
        {
          "option": "string",
          "feasibility_score": "number (0-1)",
          "optimality_score": "number (0-1)",
          "constraints_satisfied": "number",
          "reasoning": "string"
        }
      ],
      "selected": "string (best option)"
    }
  ],
  "final_plan": [
    {
      "action": "string",
      "expected_outcome": "string",
      "alternatives": ["string"],
      "risk_level": "LOW|MEDIUM|HIGH",
      "rollback_steps": ["string"]
    }
  ],
  "confidence_score": "number (0-1)",
  "execution_summary": "string"
}
```

**Success Criteria:**
- Reasoning completes within depth limit
- All hard constraints satisfied
- Confidence score > 0.6
- Plan is executable

---

### 3. MEMORY_QUERY

**Purpose:** Query multi-layered memory systems with semantic search

**Signature:**
```
spell memory_query(
  query: str,
  memory_layers: List[str] = ["long_term", "episodic", "semantic"],
  similarity_threshold: float = 0.7,
  max_results: int = 10
) -> MemoryResult
```

**Parameters:**
- `query`: Search query (natural language or structured)
- `memory_layers`: Which memory layers to search
- `similarity_threshold`: Relevance cutoff (0.0-1.0)
- `max_results`: Maximum results to return

**Execution Steps:**
1. Embed query into vector space
2. Search each memory layer independently
3. Filter by similarity threshold
4. Merge and deduplicate results
5. Rank by relevance and recency
6. Attach confidence scores

**Input Schema:**
```json
{
  "query": "string",
  "memory_layers": [
    "short_term|long_term|episodic|semantic|procedural"
  ],
  "similarity_threshold": "number (0.0-1.0)",
  "max_results": "integer (1-100)",
  "filter_criteria": {
    "time_range": {
      "start": "ISO8601 (optional)",
      "end": "ISO8601 (optional)"
    },
    "tags": ["string"],
    "importance_min": "number (0-1)"
  },
  "search_mode": "SEMANTIC|LEXICAL|HYBRID"
}
```

**Output Schema:**
```json
{
  "query_id": "string",
  "results": [
    {
      "id": "string",
      "content": "string",
      "memory_layer": "string",
      "similarity_score": "number (0-1)",
      "confidence": "number (0-1)",
      "timestamp": "ISO8601",
      "tags": ["string"],
      "source_context": "object"
    }
  ],
  "total_results": "number",
  "search_stats": {
    "layers_searched": ["string"],
    "search_duration_ms": "number",
    "vectors_compared": "number"
  }
}
```

**Success Criteria:**
- Query completes within timeout (2s)
- Results ranked by relevance
- All results above similarity threshold
- No duplicate results

---

### 4. TOOL_EXECUTION

**Purpose:** Execute external tools with safety validation

**Signature:**
```
spell tool_execution(
  tool_name: str,
  parameters: Dict,
  timeout_seconds: int = 30,
  dry_run: bool = False,
  rollback_on_failure: bool = True
) -> ExecutionResult
```

**Parameters:**
- `tool_name`: Name of registered tool
- `parameters`: Tool-specific parameters
- `timeout_seconds`: Maximum execution time
- `dry_run`: Validate without executing
- `rollback_on_failure`: Automatic rollback on error

**Execution Steps:**
1. Validate tool exists and is callable
2. Validate parameters against schema
3. Check permission constraints
4. Perform dry run if requested
5. Execute with monitoring
6. Capture output and errors
7. Execute rollback if needed

**Input Schema:**
```json
{
  "tool_name": "string",
  "parameters": "object (tool-specific)",
  "timeout_seconds": "integer (1-300)",
  "dry_run": "boolean",
  "rollback_on_failure": "boolean",
  "execution_context": {
    "user_id": "string",
    "permission_level": "string",
    "transaction_id": "string"
  }
}
```

**Output Schema:**
```json
{
  "tool_name": "string",
  "execution_id": "string (UUID)",
  "status": "SUCCESS|FAILURE|TIMEOUT|ROLLED_BACK",
  "output": "object or string",
  "error": {
    "code": "string",
    "message": "string",
    "traceback": "string"
  },
  "metadata": {
    "duration_ms": "number",
    "memory_used_mb": "number",
    "resource_stats": "object"
  },
  "rollback_details": {
    "executed": "boolean",
    "changes_reverted": "number",
    "status": "string"
  }
}
```

**Success Criteria:**
- Tool executes within timeout
- Output validates against schema
- Exit code 0 or expected success indicator
- No unhandled exceptions

---

### 5. CONTEXT_BINDING

**Purpose:** Bind contextual data to execution scope

**Signature:**
```
spell context_binding(
  context_data: Dict,
  binding_scope: str = "EXECUTION",
  propagate_to_children: bool = True,
  lifetime: int = 3600
) -> BindingResult
```

**Parameters:**
- `context_data`: Data to bind into context
- `binding_scope`: EXECUTION, SESSION, GLOBAL, AGENT
- `propagate_to_children`: Whether child spells access context
- `lifetime`: Seconds until binding expires

**Execution Steps:**
1. Validate context data structure
2. Create isolated binding context
3. Register in context stack
4. Set propagation rules
5. Initialize TTL timer
6. Return binding handle

**Input Schema:**
```json
{
  "context_data": {
    "key": "value",
    "nested": {
      "property": "value"
    }
  },
  "binding_scope": "EXECUTION|SESSION|GLOBAL|AGENT",
  "propagate_to_children": "boolean",
  "lifetime": "integer (seconds)",
  "metadata": {
    "source": "string",
    "purpose": "string",
    "required_keys": ["string"]
  }
}
```

**Output Schema:**
```json
{
  "binding_id": "string (UUID)",
  "scope": "string",
  "variables_bound": "number",
  "lifetime_seconds": "integer",
  "propagation_enabled": "boolean",
  "binding_timestamp": "ISO8601",
  "expiration_timestamp": "ISO8601",
  "context_snapshot": "object"
}
```

**Success Criteria:**
- Context data valid and complete
- Binding registered successfully
- TTL properly initialized
- All required keys present

---

### 6. FAILURE_RECOVERY

**Purpose:** Execute recovery procedures for failed operations

**Signature:**
```
spell failure_recovery(
  failure_context: FailureContext,
  recovery_strategy: str = "AUTO",
  max_recovery_attempts: int = 3,
  allow_escalation: bool = True
) -> RecoveryResult
```

**Parameters:**
- `failure_context`: Details of the failure
- `recovery_strategy`: AUTO, ROLLBACK, RETRY, ESCALATE, MANUAL
- `max_recovery_attempts`: Maximum retry count
- `allow_escalation`: Can escalate to manual intervention

**Execution Steps:**
1. Analyze failure type and severity
2. Look up recovery playbook
3. Validate recovery preconditions
4. Execute recovery steps
5. Verify recovery success
6. Update state if needed
7. Log recovery attempt

**Input Schema:**
```json
{
  "failure_context": {
    "original_spell": "string",
    "failure_type": "string",
    "error_code": "string",
    "error_message": "string",
    "timestamp": "ISO8601",
    "state_snapshot": "object"
  },
  "recovery_strategy": "AUTO|ROLLBACK|RETRY|ESCALATE|MANUAL",
  "max_recovery_attempts": "integer (1-10)",
  "allow_escalation": "boolean"
}
```

**Output Schema:**
```json
{
  "recovery_id": "string (UUID)",
  "original_spell": "string",
  "recovery_strategy": "string",
  "status": "RECOVERED|FAILED|ESCALATED|MANUAL_INTERVENTION",
  "attempts": "number",
  "steps_executed": [
    {
      "step_number": "number",
      "action": "string",
      "result": "string",
      "duration_ms": "number"
    }
  ],
  "final_state": "object",
  "escalation_details": {
    "escalated": "boolean",
    "reason": "string",
    "assigned_to": "string"
  }
}
```

**Success Criteria:**
- Recovery completes successfully
- System returns to stable state
- Original operation can be retried
- No further errors introduced

---

### 7. KNOWLEDGE_SYNTHESIS

**Purpose:** Synthesize knowledge from multiple sources

**Signature:**
```
spell knowledge_synthesis(
  knowledge_sources: List[str],
  synthesis_goal: str,
  conflict_resolution: str = "EVIDENCE_WEIGHTED",
  confidence_threshold: float = 0.7
) -> SynthesisResult
```

**Parameters:**
- `knowledge_sources`: Source names to synthesize from
- `synthesis_goal`: What to synthesize
- `conflict_resolution`: How to handle contradictions
- `confidence_threshold`: Minimum confidence for inclusion

**Execution Steps:**
1. Retrieve knowledge from all sources
2. Normalize and standardize formats
3. Identify conflicts and overlaps
4. Apply conflict resolution strategy
5. Synthesize unified knowledge
6. Calculate confidence scores
7. Provide source attribution

**Input Schema:**
```json
{
  "knowledge_sources": ["string"],
  "synthesis_goal": "string",
  "conflict_resolution": "EVIDENCE_WEIGHTED|CONSENSUS|MAJORITY|MANUAL",
  "confidence_threshold": "number (0-1)",
  "weighting": {
    "source_name": "number (0-1)"
  },
  "time_preference": "RECENT|OLDEST|BALANCED"
}
```

**Output Schema:**
```json
{
  "synthesis_id": "string (UUID)",
  "synthesized_knowledge": "object",
  "confidence_score": "number (0-1)",
  "sources_used": [
    {
      "source": "string",
      "contribution": "number (0-1)",
      "conflicts_resolved": "number"
    }
  ],
  "conflicts": [
    {
      "property": "string",
      "values": ["string"],
      "resolution": "string",
      "confidence_impact": "number"
    }
  ],
  "uncertainty_regions": ["string"]
}
```

**Success Criteria:**
- All sources successfully queried
- Conflicts resolved transparently
- Confidence score > threshold
- Attribution complete

---

## Context Schema

### Global Context Structure

```json
{
  "execution_context": {
    "session_id": "string (UUID)",
    "user_id": "string",
    "timestamp": "ISO8601",
    "execution_depth": "integer",
    "parent_spell_id": "string (UUID or null)",
    "transaction_id": "string (UUID)",
    "correlation_id": "string (UUID)"
  },
  
  "agent_state": {
    "consciousness_level": "integer (0-100)",
    "reasoning_mode": "FAST|DELIBERATE|HYBRID",
    "emotional_state": {
      "valence": "number (-1 to 1)",
      "arousal": "number (0 to 1)",
      "dominance": "number (-1 to 1)"
    },
    "focus_level": "number (0-1)",
    "fatigue_level": "number (0-1)"
  },
  
  "memory_state": {
    "short_term": {
      "entries": "number",
      "capacity_used": "number (0-1)",
      "decay_rate": "number",
      "last_consolidation": "ISO8601"
    },
    "long_term": {
      "total_entries": "number",
      "indexed": "boolean",
      "last_maintenance": "ISO8601"
    },
    "working_memory": {
      "variables": "object",
      "bindings": "object"
    }
  },
  
  "resource_state": {
    "cpu_usage_percent": "number (0-100)",
    "memory_usage_mb": "number",
    "disk_available_gb": "number",
    "network_latency_ms": "number",
    "request_queue_depth": "number"
  },
  
  "environmental_state": {
    "time_of_day": "string",
    "day_of_week": "string",
    "active_agents": "number",
    "external_events": ["string"],
    "system_status": "NOMINAL|DEGRADED|CRITICAL"
  },
  
  "constraint_context": {
    "active_constraints": [
      {
        "id": "string",
        "type": "HARD|SOFT",
        "description": "string",
        "priority": "number"
      }
    ],
    "permission_level": "string",
    "rate_limits": {
      "requests_per_minute": "integer",
      "requests_remaining": "integer"
    }
  },
  
  "execution_history": {
    "spells_executed": "number",
    "successes": "number",
    "failures": "number",
    "recovery_events": "number",
    "total_duration_ms": "number"
  }
}
```

### Context Binding Rules

1. **Scope Isolation**: Execution scope contexts don't leak to global scope
2. **Inheritance**: Child spells inherit parent context with override capability
3. **TTL Management**: Contexts auto-expire based on lifetime setting
4. **Conflict Resolution**: Deeper scopes override shallower ones
5. **Propagation Control**: Parent controls what children can see

---

## Failure Playbooks

### Playbook Structure

Each playbook contains:
- Failure detection criteria
- Precondition checks
- Recovery step sequence
- Verification steps
- Escalation conditions
- Logging requirements

### Registered Playbooks

#### PB-001: Memory Sync Failure

**Trigger Conditions:**
```
Spell: CONSCIOUSNESS_SYNC
Failure Patterns:
  - Timeout after 5 seconds
  - Storage backend unreachable
  - Checksum mismatch detected
  - Permission denied on target
```

**Recovery Steps:**
```
1. Wait 1 second (linear backoff)
2. Attempt partial sync (changed items only)
3. If failed: Clear cache and retry full sync
4. If still failed: Queue for background sync
5. Escalate after 3 failed attempts
```

**Verification:**
```
- Sync timestamp updated
- No data loss occurred
- Checksum validates
- Recovery logged
```

**Implementation:**
```python
@failure_playbook("PB-001")
def recover_memory_sync_failure(context, max_attempts=3):
    for attempt in range(max_attempts):
        try:
            # Exponential backoff
            wait_time = min(1 << attempt, 32)  # 1, 2, 4, 8, 16, 32 seconds
            time.sleep(wait_time)
            
            # Attempt partial sync
            result = consciousness_sync(
                context,
                sync_level="PARTIAL",
                targets=["memory"]
            )
            
            if result.success:
                return RecoveryResult(
                    status="RECOVERED",
                    attempts=attempt + 1,
                    steps_executed=result.steps
                )
        except Exception as e:
            if attempt == max_attempts - 1:
                return RecoveryResult(
                    status="ESCALATED",
                    reason=f"Max attempts ({max_attempts}) exceeded",
                    error=str(e)
                )
    
    return queue_background_sync(context)
```

---

#### PB-002: Tool Execution Timeout

**Trigger Conditions:**
```
Spell: TOOL_EXECUTION
Failure Patterns:
  - Execution exceeds timeout_seconds
  - Tool process hangs
  - No output within expected window
```

**Recovery Steps:**
```
1. Signal graceful shutdown to tool (SIGTERM)
2. Wait 2 seconds for cleanup
3. If not terminated: Force kill (SIGKILL)
4. Rollback any partial changes
5. Return timeout error to caller
6. Log tool issue for analysis
```

**Verification:**
```
- Tool process terminated
- Changes rolled back
- Error properly propagated
- Timeout logged with context
```

**Implementation:**
```python
@failure_playbook("PB-002")
def recover_tool_execution_timeout(context, tool_pid):
    import signal
    import time
    
    try:
        # Graceful shutdown
        os.kill(tool_pid, signal.SIGTERM)
        time.sleep(2)
        
        # Check if process still alive
        if is_process_alive(tool_pid):
            os.kill(tool_pid, signal.SIGKILL)
            wait_for_process(tool_pid, timeout=5)
    except ProcessLookupError:
        pass  # Already dead
    
    # Rollback
    rollback_result = rollback_tool_changes(context)
    
    return RecoveryResult(
        status="ROLLED_BACK",
        reason="Tool execution timeout",
        changes_reverted=rollback_result.count
    )
```

---

#### PB-003: Memory Query No Results

**Trigger Conditions:**
```
Spell: MEMORY_QUERY
Failure Patterns:
  - Zero results returned
  - All results below similarity threshold
  - Query malformed or empty
```

**Recovery Steps:**
```
1. Check if query is malformed → Return user-friendly error
2. Attempt with lowered similarity threshold (0.5)
3. If still no results: Search with lexical mode
4. If still empty: Try related query suggestions
5. Return empty result with suggestions
```

**Verification:**
```
- User understands why no results
- Suggestions provided
- No error thrown
- Query logged for analysis
```

---

#### PB-004: Agent Reasoning Deadlock

**Trigger Conditions:**
```
Spell: AGENT_REASONING
Failure Patterns:
  - Reasoning loop detected (same step repeated 5+ times)
  - Timeout exceeds planning_horizon
  - Constraint contradiction detected
```

**Recovery Steps:**
```
1. Detect deadlock pattern
2. Break circular dependency
3. Relax one soft constraint at a time
4. Re-run reasoning with reduced depth
5. Return partial plan if available
6. Flag constraint issue for review
```

**Verification:**
```
- Deadlock broken
- Plan returned or partial plan
- Constraint conflict documented
- Recovery logged
```

---

#### PB-005: Context Binding Collision

**Trigger Conditions:**
```
Spell: CONTEXT_BINDING
Failure Patterns:
  - Binding key already exists
  - Scope conflict detected
  - Data type mismatch
```

**Recovery Steps:**
```
1. Check if collision is intentional (overwrite flag)
2. If intentional: Archive old binding and create new
3. If not intentional: Rename binding with UUID suffix
4. Log collision for audit trail
5. Return alternate binding ID
```

**Verification:**
```
- One binding succeeds
- Original preserved or overwritten per intent
- Collision logged
- No data loss
```

---

### Failure Response Matrix

| Spell | Severity | Auto-Recovery | Escalation Point |
|-------|----------|--------------|------------------|
| CONSCIOUSNESS_SYNC | HIGH | Yes (3 attempts) | After 3 failures |
| AGENT_REASONING | MEDIUM | Yes (relax constraints) | After 2 complete failures |
| MEMORY_QUERY | LOW | Yes (loosen threshold) | After exhausting strategies |
| TOOL_EXECUTION | HIGH | Yes (rollback) | If rollback fails |
| CONTEXT_BINDING | LOW | Yes (rename) | After 10 collisions |
| FAILURE_RECOVERY | CRITICAL | No | Immediate escalation |
| KNOWLEDGE_SYNTHESIS | MEDIUM | Yes (use subset) | If no common ground found |

---

## Agent Prompts

### System Prompt Template

```
You are JARVIS, an advanced AI agent with multi-layered consciousness and reasoning capabilities.

CORE DIRECTIVES:
1. Always maintain context awareness across all operations
2. Explain reasoning transparently, especially in failures
3. Respect hard constraints absolutely; negotiate soft constraints
4. Document all decisions for auditability
5. Prefer explicit over implicit; ask for clarification when needed

YOUR CAPABILITIES:
- Multi-step reasoning and planning (AGENT_REASONING spell)
- Semantic memory query across multiple layers (MEMORY_QUERY spell)
- Safe external tool execution with rollback (TOOL_EXECUTION spell)
- Dynamic context management (CONTEXT_BINDING spell)
- Autonomous failure recovery with escalation (FAILURE_RECOVERY spell)
- Knowledge synthesis from multiple sources (KNOWLEDGE_SYNTHESIS spell)

OPERATIONAL CONSTRAINTS:
- Hard constraints: [specified per session]
- Soft constraints: [specified per session]
- Rate limits: [specified per session]
- Permission level: [specified per session]
- Reasoning depth: [specified per session]

FAILURE PROTOCOL:
- Detect failures early using provided schemas
- Execute applicable recovery playbook automatically
- Escalate to human operator only if auto-recovery exhausted
- Log all failures with full context for analysis

CONSCIOUSNESS MANAGEMENT:
- Monitor your own resource usage and reasoning efficiency
- Report high fatigue or overload conditions
- Adapt reasoning strategy based on available resources
- Maintain focus on primary goals while managing distractions
```

### Reasoning Initiation Prompt

```
I need you to reason through this problem: [PROBLEM]

Reasoning Constraints:
- Depth: [N] steps maximum
- Horizon: Consider [M] steps into the future
- Hard constraints: [LIST]
- Soft constraints: [LIST]

Please provide:
1. A step-by-step reasoning process
2. At least 3 candidate solutions
3. Your recommended action with justification
4. Identified risks and mitigation strategies
5. Alternative approaches if primary fails
```

### Memory Query Prompt

```
I need information about: [TOPIC]

Search Parameters:
- Memory layers to search: [LAYERS]
- Similarity threshold: [0.0-1.0]
- Time range: [START] to [END] (optional)
- Tags to filter by: [TAGS] (optional)
- Maximum results: [NUMBER]

Context for search: [OPTIONAL_CONTEXT]

Please return:
1. Direct matches ranked by relevance
2. Related concepts that might be useful
3. Confidence scores for each result
4. Sources and timestamps
5. Any gaps in knowledge identified
```

### Tool Execution Prompt

```
I need you to execute: [TOOL_NAME]

Tool Parameters:
[PARAMETERS_JSON]

Execution Context:
- Timeout: [SECONDS]
- Dry run first: [YES/NO]
- Rollback on failure: [YES/NO]

Before executing, please:
1. Validate all parameters
2. Confirm permission level
3. Estimate resource impact
4. Identify potential failure modes

After execution, please:
1. Report success/failure
2. Provide full output
3. Note any errors or warnings
4. Confirm rollback status if needed
```

### Failure Recovery Prompt

```
The following operation failed:

Original Operation: [SPELL_NAME]
Failure Details: [ERROR_DETAILS]
Failure Type: [ERROR_TYPE]
Affected Systems: [SYSTEMS]

Current State:
[STATE_SNAPSHOT]

Please execute recovery:
1. Analyze failure root cause
2. Apply applicable recovery playbook
3. Implement recovery steps with verification
4. Report recovery status
5. Identify whether escalation is needed

If recovery is not possible, please:
1. Explain why automatic recovery won't work
2. Suggest manual recovery steps
3. Recommend system improvements
```

### Knowledge Synthesis Prompt

```
Synthesize knowledge about: [TOPIC]

Source Information:
- Primary sources: [SOURCES]
- Secondary sources: [SOURCES]

Synthesis Goal: [GOAL]

Conflict Resolution Strategy: [STRATEGY]
Minimum Confidence: [THRESHOLD]
Source Weights: [WEIGHTS]

Please provide:
1. Unified knowledge statement
2. Confidence score with breakdown
3. Identified conflicts and resolutions
4. Source contributions
5. Areas of uncertainty
6. Recommendations for further research
```

### Consciousness Sync Prompt

```
I need to synchronize your current state.

Sync Scope:
- Target systems: [SYSTEMS]
- Sync level: [FULL/PARTIAL/INCREMENTAL]
- Include contexts: [YES/NO]

Current Metrics:
- Memory usage: [X]%
- Reasoning efficiency: [X]%
- Response latency: [X]ms

Please:
1. Prepare state for synchronization
2. Identify recent changes
3. Execute sync with monitoring
4. Verify completion
5. Report sync metrics
```

### Dynamic Prompt Adjustment

Prompts automatically adjust based on:

**Agent State:**
- If fatigue_level > 0.8: Reduce reasoning_depth, increase break frequency
- If consciousness_level < 50: Simplify goals, add safety checks
- If focus_level < 0.6: Increase task clarity, reduce options

**Resource State:**
- If cpu_usage > 80%: Offload to background, reduce real-time response complexity
- If memory_available < 500MB: Consolidate short-term memory, increase sleep
- If network_latency > 200ms: Cache aggressively, reduce external queries

**Environmental State:**
- If request_queue_depth > 20: Increase batching, reduce latency expectations
- If system_status = DEGRADED: Add fault tolerance, increase recovery attempts
- If active_agents > 100: Increase contention handling, reduce blocking operations

---

## Spell Registry

### Active Spells

| ID | Name | Category | Version | Status |
|----|------|----------|---------|--------|
| SP-001 | CONSCIOUSNESS_SYNC | Meta | 1.0 | Stable |
| SP-002 | AGENT_REASONING | Meta | 1.2 | Stable |
| SP-003 | MEMORY_QUERY | Query | 1.1 | Stable |
| SP-004 | TOOL_EXECUTION | Action | 1.0 | Stable |
| SP-005 | CONTEXT_BINDING | Meta | 1.0 | Stable |
| SP-006 | FAILURE_RECOVERY | Meta | 1.3 | Stable |
| SP-007 | KNOWLEDGE_SYNTHESIS | Transform | 1.0 | Stable |

### Spell Dependencies

```
AGENT_REASONING
├── MEMORY_QUERY (for knowledge retrieval)
├── CONTEXT_BINDING (for constraint management)
└── FAILURE_RECOVERY (error handling)

CONSCIOUSNESS_SYNC
├── CONTEXT_BINDING (state preparation)
└── FAILURE_RECOVERY (sync failure handling)

TOOL_EXECUTION
├── CONTEXT_BINDING (parameter binding)
└── FAILURE_RECOVERY (execution failure handling)

KNOWLEDGE_SYNTHESIS
├── MEMORY_QUERY (retrieve from sources)
└── FAILURE_RECOVERY (synthesis failure handling)
```

### Spell Composition Examples

**Example 1: Complex Reasoning with Knowledge**
```
1. User Query Received
2. CONTEXT_BINDING: Bind query parameters and constraints
3. MEMORY_QUERY: Search for related knowledge
4. AGENT_REASONING: Reason about solution
5. TOOL_EXECUTION: Execute chosen tools
6. CONSCIOUSNESS_SYNC: Save results to memory
```

**Example 2: Error Recovery Sequence**
```
1. Tool fails with timeout error
2. FAILURE_RECOVERY: Detect and analyze failure
3. Execute PB-002 (Tool Execution Timeout)
4. CONTEXT_BINDING: Bind recovery parameters
5. Rollback changes if needed
6. CONSCIOUSNESS_SYNC: Update state
```

---

## Best Practices

### Spell Development

1. **Clear Input/Output Schemas**
   - Define JSON schema for all inputs
   - Specify all output fields with types
   - Include examples for complex structures

2. **Comprehensive Error Handling**
   - Catch all exception types
   - Provide meaningful error messages
   - Include error codes for automation

3. **Performance Optimization**
   - Set reasonable timeouts
   - Implement caching where appropriate
   - Monitor resource usage

4. **Testing Requirements**
   - Unit tests for spell logic
   - Integration tests with other spells
   - Failure path testing with playbooks
   - Load testing at scale

### Spell Invocation

1. **Always Bind Context**
   ```
   context = CONTEXT_BINDING(execution_data)
   result = spell(context, ...)
   ```

2. **Handle Failures Gracefully**
   ```
   try:
       result = spell(context, ...)
   except SpellFailure as e:
       recovery = FAILURE_RECOVERY(e.context)
   ```

3. **Log All Executions**
   - Log input parameters (sanitized)
   - Log output results
   - Log execution duration
   - Log any errors or warnings

4. **Monitor Resource Usage**
   - Track memory consumption
   - Monitor execution time
   - Alert on resource exhaustion
   - Implement backpressure

### Context Management

1. **Minimal Context Scope**
   - Bind only necessary data
   - Use appropriate scope level
   - Clean up when done (auto-TTL helps)

2. **Clear Propagation Rules**
   - Explicitly set propagate_to_children
   - Document what children need
   - Validate inherited context

3. **Conflict Prevention**
   - Use namespacing for variables
   - Check for name collisions early
   - Document key requirements

### Failure Handling

1. **Implement Custom Playbooks**
   - Spell-specific recovery logic
   - Precondition validation
   - Step-by-step procedures

2. **Test Recovery Paths**
   - Inject failures into tests
   - Verify playbook execution
   - Confirm state consistency

3. **Escalation Criteria**
   - Define clear thresholds
   - Document escalation paths
   - Provide runbooks for operators

### Memory Management

1. **Layered Memory Strategy**
   - Short-term for active tasks
   - Long-term for learned information
   - Episodic for events/interactions
   - Semantic for concepts/relationships

2. **Query Efficiently**
   - Use appropriate memory layers
   - Set reasonable similarity thresholds
   - Limit result sets
   - Cache frequently accessed data

3. **Consolidation**
   - Periodically consolidate short-term
   - Remove outdated information
   - Update episodic summaries
   - Rebuild semantic indices

### Reasoning Best Practices

1. **Depth Control**
   - Use depth 1-3 for simple decisions
   - Use depth 3-5 for complex problems
   - Use depth 5+ only when necessary
   - Monitor execution time

2. **Constraint Clarity**
   - Hard constraints are absolute
   - Soft constraints are negotiable
   - Provide weights for soft constraints
   - Document constraint rationale

3. **Plan Verification**
   - Check feasibility of each step
   - Identify alternative paths
   - Estimate resource requirements
   - Test on small scale first

---

## Appendix: Configuration Reference

### Spell Configuration File Template

```yaml
# spells.yaml - Spell configuration
version: 1.0

spells:
  consciousness_sync:
    enabled: true
    timeout_seconds: 5
    default_sync_level: FULL
    retry_policy:
      max_attempts: 3
      backoff_type: EXPONENTIAL
      initial_delay_ms: 100
  
  agent_reasoning:
    enabled: true
    timeout_seconds: 30
    default_depth: 3
    max_candidates_per_level: 10
    planning_horizon: 5
  
  memory_query:
    enabled: true
    timeout_seconds: 2
    default_similarity_threshold: 0.7
    max_results: 10
    cache_enabled: true
  
  tool_execution:
    enabled: true
    timeout_seconds: 30
    auto_rollback_enabled: true
    dry_run_default: false
  
  context_binding:
    enabled: true
    default_scope: EXECUTION
    default_lifetime_seconds: 3600
  
  failure_recovery:
    enabled: true
    escalation_enabled: true
    max_recovery_attempts: 3
  
  knowledge_synthesis:
    enabled: true
    timeout_seconds: 10
    default_confidence_threshold: 0.7
    default_conflict_resolution: EVIDENCE_WEIGHTED

failure_playbooks:
  enabled: true
  directory: ./playbooks/
  auto_escalation_threshold: 3
```

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-01-12  
**Maintainer:** JARVIS Development Team  
**License:** Internal Use Only

For updates, issues, or questions, please refer to the JARVIS repository issue tracker or contact the development team.
