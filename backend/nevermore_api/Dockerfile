FROM python:3.12.3-slim

# set work directory
WORKDIR /usr/src/app

# set env. variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# copy src
COPY . .

# install dependencies
RUN pip install -r requirements.txt

EXPOSE 8000
ENTRYPOINT [ "gunicorn", "api.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000" ]