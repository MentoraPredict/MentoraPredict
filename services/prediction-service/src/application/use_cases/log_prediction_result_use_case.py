# Skeleton — log_prediction_result use case
# Persists inference metadata to MongoDB for traceability (RNF-040)
from abc import ABC, abstractmethod

class LogPredictionResultUseCase(ABC):
    @abstractmethod
    def execute(self, log_data: dict) -> None:
        """
        Saves: anonymous_student_id, features, output, model_metadata, inference_date
        """
        pass
