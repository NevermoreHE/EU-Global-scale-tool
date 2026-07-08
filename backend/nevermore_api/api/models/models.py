from sqlalchemy import ARRAY, Boolean, DateTime, Integer, Numeric, PrimaryKeyConstraint, String, Text, Uuid, text
from sqlalchemy.orm import mapped_column

from api.database import Base

class Chat(Base):
    __tablename__ = 'chat'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='chat_pkey'),
    )

    id = mapped_column(Integer)
    texto = mapped_column(Text)
    user_id = mapped_column(Uuid)
    user_name = mapped_column(String(30), nullable=False)
    created_at = mapped_column(DateTime, nullable=False, server_default=text('CURRENT_TIMESTAMP'))

class Scenario(Base):
    __tablename__ = 'scenario'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='scenario_pkey'),
    )

    id = mapped_column(Integer)
    name = mapped_column(String(100), nullable=False)
    is_public = mapped_column(Boolean, nullable=False)
    description = mapped_column(Text)
    user_id = mapped_column(Uuid)
    created_at = mapped_column(DateTime, nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    policies = mapped_column(ARRAY(Numeric()))
    serie_hash = mapped_column(Uuid)
    taskid = mapped_column(Uuid)