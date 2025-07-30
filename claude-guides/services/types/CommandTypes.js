/**
 * 명령어 타입 정의
 * @date 2025-07-30
 */

const ExecutionMode = {
    SEQUENTIAL: "sequential",
    PARALLEL: "parallel",
    HYBRID: "hybrid"
};

const Priority = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical"
};

const ComplexityLevel = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high"
};

module.exports = {
    ExecutionMode,
    Priority,
    ComplexityLevel
};
