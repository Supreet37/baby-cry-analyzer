import joblib

scaler = joblib.load("scaler.pkl")

print("Expected features:", scaler.n_features_in_)