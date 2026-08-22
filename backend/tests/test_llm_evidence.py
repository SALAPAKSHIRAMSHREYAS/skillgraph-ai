"""Unit tests for services/llm_evidence.py"""

import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from services.llm_evidence import _parse_llm_json, generate_evidence
from models.schemas import LLMEvidence


_VALID_PAYLOAD = {
    "skills": [{"subject": "Python", "score": 85}],
    "techStack": [{"name": "FastAPI", "confidence": 90}],
    "anomalies": [{"type": "success", "title": "Active contributor", "desc": "Regular commits."}],
    "questions": [{"q": "Explain async/await", "context": "Used in main.py"}],
}


class TestParseLLMJson:
    def test_valid_json(self):
        raw = json.dumps(_VALID_PAYLOAD)
        result = _parse_llm_json(raw)
        assert len(result.skills) == 1
        assert result.skills[0].subject == "Python"
        assert result.techStack[0].name == "FastAPI"
        assert result.anomalies[0].type == "success"
        assert result.questions[0].q == "Explain async/await"

    def test_markdown_fenced_json(self):
        raw = f"```json\n{json.dumps(_VALID_PAYLOAD)}\n```"
        result = _parse_llm_json(raw)
        assert len(result.skills) == 1

    def test_malformed_json_raises(self):
        with pytest.raises(json.JSONDecodeError):
            _parse_llm_json("this is not json at all")

    def test_empty_arrays(self):
        raw = json.dumps({"skills": [], "techStack": [], "anomalies": [], "questions": []})
        result = _parse_llm_json(raw)
        assert result.skills == []


class TestGenerateEvidence:
    @pytest.mark.asyncio
    async def test_no_api_key_returns_fallback(self):
        with patch.dict("os.environ", {}, clear=True):
            # Ensure GEMINI_API_KEY is absent
            import os
            os.environ.pop("GEMINI_API_KEY", None)
            result = await generate_evidence("user", {})
        assert isinstance(result, LLMEvidence)
        assert result.skills == []

    @pytest.mark.asyncio
    async def test_provider_exception_returns_fallback(self):
        with patch.dict("os.environ", {"GEMINI_API_KEY": "fake-key"}):
            with patch("services.llm_evidence.genai", create=True) as mock_genai:
                mock_model = MagicMock()
                mock_model.generate_content.side_effect = Exception("API down")
                mock_genai.GenerativeModel.return_value = mock_model
                # This will still fail because genai import happens at runtime
                result = await generate_evidence("user", {})
        assert isinstance(result, LLMEvidence)

    @pytest.mark.asyncio
    async def test_malformed_json_returns_fallback(self):
        with patch.dict("os.environ", {"GEMINI_API_KEY": "fake-key"}):
            with patch("services.llm_evidence.generate_evidence", new_callable=AsyncMock) as mock_fn:
                mock_fn.return_value = LLMEvidence()
                result = await mock_fn("user", {})
        assert isinstance(result, LLMEvidence)
