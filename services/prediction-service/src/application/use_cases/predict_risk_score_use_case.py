# Skeleton — predict_risk_score use case
# TODO: implement in Sprint 4
from abc import ABC, abstractmethod

class PredictRiskScoreUseCase(ABC):
    @abstractmethod
    def execute(self, features: dict) -> dict:
        """
        Input:  anonymized feature dict (no PII — RNF-042)
        Output: { risk_score, risk_level, confidence_score, model_metadata }
        """
        pass
