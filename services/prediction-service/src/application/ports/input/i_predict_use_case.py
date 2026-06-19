# Skeleton — Input port (primary port)
from abc import ABC, abstractmethod

class IPredictUseCase(ABC):
    @abstractmethod
    def predict_risk(self, features: dict) -> dict:
        """TODO: define input/output types with Pydantic DTOs"""
        pass
