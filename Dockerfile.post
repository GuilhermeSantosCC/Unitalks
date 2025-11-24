FROM python:3.10
WORKDIR /app
COPY ./backend/post_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ./backend/post_service_service .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]