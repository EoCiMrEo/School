# Use Python slim image because it is lightweight
FROM python:3.12-slim

# Labels
LABEL version="1.0"
LABEL description="Python Backend - Cole Fitness Center"

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["python", "main.py"]