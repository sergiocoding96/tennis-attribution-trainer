"""Export pipeline output to JSON."""
import json
from typing import Any, Dict
from .schema import PipelineOutput


def export_json(output: PipelineOutput, indent: int = 2) -> str:
    """Serialize PipelineOutput to JSON string."""
    return json.dumps(output.to_dict(), indent=indent)
