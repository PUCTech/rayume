from datetime import datetime
from sqlalchemy import DateTime, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Session

from .config import settings

engine = create_engine(settings.database_url)

class Base(DeclarativeBase):
    # team convention: every str is `text`, every timestamp is `timestamptz`
    type_annotation_map = {str: Text, datetime: DateTime(timezone=True)}


def get_db():
    with Session(engine) as session:
        yield session
