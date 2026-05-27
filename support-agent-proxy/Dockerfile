FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY prod_fast_api_app.py .
CMD exec uvicorn prod_fast_api_app:app --host 0.0.0.0 --port ${PORT:-8080}
