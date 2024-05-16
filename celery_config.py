from celery import Celery
from app import app

# 使用 Flask 应用的配置
celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

@app.before_first_request
def setup_celery():
    celery.conf.update(app.config)
