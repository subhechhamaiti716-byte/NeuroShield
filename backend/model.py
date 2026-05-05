import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

class FraudDetectionModel:
    def __init__(self):
        # Initialize the Isolation Forest Model
        # contamination represents the proportion of outliers in the data
        self.model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        self.is_trained = False
        
        # In a real app, this would be loaded from a database
        self.user_history = []
        
    def extract_features(self, transaction: dict) -> np.ndarray:
        # Simple feature extraction
        # We could use location, amount, device, time
        amount = transaction.get("amount", 0.0)
        # For simplicity, returning just the amount as a 2D array
        # In reality, you'd add more features (e.g. distance from last location)
        return np.array([[amount]])
        
    def train(self, historical_transactions: list):
        if not historical_transactions:
            return
            
        features = []
        for t in historical_transactions:
            features.append(self.extract_features(t)[0])
            
        # Fit the model
        if len(features) > 10:  # Need minimum data to train effectively
            self.model.fit(features)
            self.is_trained = True
            
    def predict_score(self, transaction: dict) -> float:
        if not self.is_trained:
            # Fallback rule-based if no history
            amount = transaction.get("amount", 0)
            return 0.9 if amount > 10000 else 0.1
            
        features = self.extract_features(transaction)
        
        # Get anomaly score (negative values are outliers in sklearn)
        # We normalize it to 0-1 probability score
        score = self.model.decision_function(features)[0]
        
        # sklearn decision_function returns positive for normal, negative for anomaly
        # We want fraud_score where 1 is highly anomalous
        # Just doing a simple inversion for prototype purposes
        fraud_score = 0.5 - (score * 0.5)
        
        # Ensure it's bounded 0 to 1
        return max(0.0, min(1.0, fraud_score))

# Singleton instance
fraud_model = FraudDetectionModel()
