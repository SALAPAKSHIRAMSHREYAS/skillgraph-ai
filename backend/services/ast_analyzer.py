"""
Python AST complexity analysis.

Parses Python source files without executing them and computes:
  - function count  (FunctionDef + AsyncFunctionDef)
  - class count     (ClassDef)
  - branch count    (If + For + While + Try)
  - complexity score = branches*2 + functions + classes*1.5

Complexity grade thresholds (per the PRD):
  A: score >= 15
  B: score >= 8
  C: score >= 3
  D: score <  3
"""

import ast
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Per-file analysis
# ---------------------------------------------------------------------------

def analyze_source(source: str) -> Dict[str, Any]:
    """
    Parse a Python source string and return metrics.
    Returns zeroed metrics on SyntaxError or other parse failures.
    """
    zero = {"functions": 0, "classes": 0, "branches": 0, "complexity": 0.0, "error": False}
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        logger.debug("AST parse SyntaxError: %s", exc)
        return {**zero, "error": True}
    except Exception as exc:  # pragma: no cover
        logger.warning("Unexpected AST parse error: %s", exc)
        return {**zero, "error": True}

    functions = sum(
        1 for node in ast.walk(tree)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    )
    classes = sum(
        1 for node in ast.walk(tree)
        if isinstance(node, ast.ClassDef)
    )
    branches = sum(
        1 for node in ast.walk(tree)
        if isinstance(node, (ast.If, ast.For, ast.While, ast.Try))
    )
    complexity = branches * 2 + functions + classes * 1.5

    return {
        "functions": functions,
        "classes": classes,
        "branches": branches,
        "complexity": complexity,
        "error": False,
    }


# ---------------------------------------------------------------------------
# Grade mapping
# ---------------------------------------------------------------------------

def complexity_grade(avg_complexity: float) -> str:
    """Map an average complexity value to an A/B/C/D grade."""
    if avg_complexity >= 15:
        return "A"
    if avg_complexity >= 8:
        return "B"
    if avg_complexity >= 3:
        return "C"
    return "D"


# ---------------------------------------------------------------------------
# Aggregation across multiple files
# ---------------------------------------------------------------------------

def aggregate_metrics(file_metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Combine per-file metrics into repository-level totals.
    Returns dict with total functions/classes/branches, avg complexity, and grade.
    """
    valid = [m for m in file_metrics if not m.get("error")]
    if not valid:
        return {
            "total_functions": 0,
            "total_classes": 0,
            "total_branches": 0,
            "avg_complexity": 0.0,
            "grade": "D",
            "files_analyzed": 0,
            "files_errored": len(file_metrics),
        }

    total_functions = sum(m["functions"] for m in valid)
    total_classes = sum(m["classes"] for m in valid)
    total_branches = sum(m["branches"] for m in valid)
    avg_complexity = sum(m["complexity"] for m in valid) / len(valid)

    return {
        "total_functions": total_functions,
        "total_classes": total_classes,
        "total_branches": total_branches,
        "avg_complexity": round(avg_complexity, 2),
        "grade": complexity_grade(avg_complexity),
        "files_analyzed": len(valid),
        "files_errored": len(file_metrics) - len(valid),
    }
