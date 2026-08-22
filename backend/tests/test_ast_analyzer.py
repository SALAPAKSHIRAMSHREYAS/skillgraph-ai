"""Unit tests for services/ast_analyzer.py"""

import pytest
from services.ast_analyzer import analyze_source, aggregate_metrics, complexity_grade


class TestAnalyzeSource:
    def test_empty_file(self):
        result = analyze_source("")
        assert result["functions"] == 0
        assert result["classes"] == 0
        assert result["branches"] == 0
        assert result["complexity"] == 0.0
        assert result["error"] is False

    def test_syntax_error(self):
        result = analyze_source("def foo(:\n    pass")
        assert result["error"] is True
        assert result["functions"] == 0

    def test_counts_functions(self):
        src = "def foo(): pass\ndef bar(): pass\nasync def baz(): pass"
        result = analyze_source(src)
        assert result["functions"] == 3
        assert result["error"] is False

    def test_counts_classes(self):
        src = "class A: pass\nclass B: pass"
        result = analyze_source(src)
        assert result["classes"] == 2

    def test_counts_branches(self):
        src = """
if True:
    pass
for i in range(10):
    pass
while False:
    pass
try:
    pass
except:
    pass
"""
        result = analyze_source(src)
        assert result["branches"] == 4

    def test_complexity_formula(self):
        # 1 function, 1 class, 2 branches → 2*2 + 1 + 1*1.5 = 6.5
        src = """
class MyClass:
    def method(self):
        if True:
            pass
        for x in []:
            pass
"""
        result = analyze_source(src)
        assert result["functions"] == 1
        assert result["classes"] == 1
        assert result["branches"] == 2
        assert result["complexity"] == pytest.approx(6.5)


class TestComplexityGrade:
    def test_grade_a(self):
        assert complexity_grade(15.0) == "A"
        assert complexity_grade(20.0) == "A"

    def test_grade_b(self):
        assert complexity_grade(8.0) == "B"
        assert complexity_grade(14.9) == "B"

    def test_grade_c(self):
        assert complexity_grade(3.0) == "C"
        assert complexity_grade(7.9) == "C"

    def test_grade_d(self):
        assert complexity_grade(0.0) == "D"
        assert complexity_grade(2.9) == "D"


class TestAggregateMetrics:
    def test_all_errors(self):
        result = aggregate_metrics([{"error": True}])
        assert result["grade"] == "D"
        assert result["files_analyzed"] == 0
        assert result["files_errored"] == 1

    def test_empty_list(self):
        result = aggregate_metrics([])
        assert result["grade"] == "D"
        assert result["files_analyzed"] == 0

    def test_aggregation(self):
        m1 = {"functions": 2, "classes": 1, "branches": 3, "complexity": 9.5, "error": False}
        m2 = {"functions": 1, "classes": 0, "branches": 2, "complexity": 5.0, "error": False}
        result = aggregate_metrics([m1, m2])
        assert result["total_functions"] == 3
        assert result["total_classes"] == 1
        assert result["total_branches"] == 5
        assert result["avg_complexity"] == pytest.approx(7.25)
        assert result["grade"] == "C"
        assert result["files_analyzed"] == 2
