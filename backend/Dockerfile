FROM python:3.11-slim

# Create non-root user for security
RUN groupadd --gid 1000 apprunner \
    && useradd --uid 1000 --gid apprunner --shell /bin/bash --create-home apprunner

WORKDIR /app

# Install dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Own files (for non-root)
RUN chown -R apprunner:apprunner /app

USER apprunner

EXPOSE 8000

# PORT env var supported by App Runner, Cloud Run, etc.
ENV PORT=8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
