# Skeleton — Output port (secondary port) for MongoDB prediction logs
from abc import ABC, abstractmethod

class IPredictionLogRepository(ABC):
    @abstractmethod
    def save(self, log: dict) -> None:
        """TODO: persist prediction log to MongoDB (RNF-040 traceability)"""
        pass
