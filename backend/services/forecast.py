import pandas as pd 
import numpy as np 
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
import time
from datetime import datetime,timedelta

class MemoryCache:
    """Mimics Redis for local development without needing a Docker container."""
    def __init__(self):
        self.store = {}

    def get(self, key):
        if key in self.store:
            data, expiry = self.store[key]
            if time.time() < expiry:
                return data
            else:
                del self.store[key] # Clean up expired cache
        return None

    def set(self, key, value, ex):
        # ex is Time-To-Live in seconds
        self.store[key] = (value, time.time() + ex)

cache = MemoryCache()

def generate_30_day_forecast(df: pd.DataFrame, target_revenue : float):
    df['created_at'] = pd.to_datetime(df['created_at'])
    daily_rev = df.groupby(df['created_at'].dt.date)['total_price'].sum().reset_index()
    daily_rev.columns = ['date','revenue']
    daily_rev['date'] = pd.to_datetime(daily_rev['date'])
    
    if(len(daily_rev) < 14):
        return {"error": "Not enough historical data tot generate a forecast. Need at least 14 days."}
    
    daily_rev = daily_rev.sort_values('date').reset_index(drop=True)
    daily_rev['t'] = np.arange(len(daily_rev))
    daily_rev['day_of_week'] = daily_rev['date'].dt.dayofweek
    
    X = daily_rev[['t','day_of_week']]
    X_encoded = pd.get_dummies(X['day_of_week'], drop_first=True)
    y = daily_rev['revenue']
    
    model  = LinearRegression()
    model.fit(X_encoded, y)
    
    predictions = model.predict(X_encoded)
    r2 = r2_score(y, predictions)
    confidence_level = "low" if r2<0.35 else "high"
    
    residuals = y - predictions
    rse = np.sqrt(np.sum(residuals**2)/(len(y)-2))
    margin_of_error = 1.96 * rse 
    
    last_date = daily_rev['date'].max()
    future_dates = [last_date + timedelta(days=i) for i in range(1,31)]
    
    future_df = pd.DataFrame({
        'date':future_dates
    })
    
    future_df['t'] = np.arange(len(daily_rev),len(daily_rev)+30)
    future_df['day_of_week'] = future_df['date'].dt.dayofweek
    
    X_future = future_df[['t','day_of_week']]
    X_future_encoded = pd.get_dummies(X_future,columns = ['day_of_week'], drop_first=True)
    
    X_future_encoded = X_future_encoded.reindex(columns=X_encoded.columns, fill_value=0)
    
    future_predictions = model.predict(X_future_encoded)
    
    forecast_data = []
    projected_total = 0
    
    for i,data in enumerate(future_dates):
        pred = max(0,future_predictions[i])
        projected_total += pred
        forecast_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "predicted": round(pred, 2),
            "upper_band": round(pred + margin_of_error, 2),
            "lower_band": round(max(0, pred - margin_of_error), 2)
        })
        goal_delta_pct = 0
        if target_revenue >0:
            goal_delta_pct = round(((projected_total -target_revenue) / target_revenue)*100, 2)
            
            return{
                "forecast":forecast_data,
                "r_squared": round(r2, 2),
                "confidence": confidence_level,
                "projected_30d_total": round(projected_total, 2),
                "goal_delta_pct": goal_delta_pct
            }