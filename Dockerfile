# Base image
FROM python:3.9

# Working directory
WORKDIR /app

# Copy dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy entire project
COPY . .

# Run Flask app
CMD ["python", "app.py"]