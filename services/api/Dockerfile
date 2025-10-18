# Use Python runtime as base
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file from its location relative to the root
COPY services/api/requirements.txt .

# Install PyTorch CPU version first (lighter and faster)
RUN pip install --no-cache-dir --timeout 1000 --retries 5 --no-deps torch==1.13.1+cpu --index-url https://download.pytorch.org/whl/cpu

# Install other dependencies
RUN pip install --no-cache-dir --timeout 1000 --retries 5 -r requirements.txt

# Copy your application's source code AND the scripts
COPY services/api/src ./src
COPY scripts ./scripts

# Command to run the application with auto-reload for development
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]