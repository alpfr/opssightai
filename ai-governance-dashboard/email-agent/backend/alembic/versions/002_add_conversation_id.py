"""add conversation_id to agent_conversations

Revision ID: 002
Revises: 001
Create Date: 2026-02-16 14:20:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add conversation_id column (nullable first)
    op.add_column('agent_conversations', 
        sa.Column('conversation_id', sa.String(), nullable=True)
    )
    
    # Populate existing rows with UUIDs
    op.execute("""
        UPDATE agent_conversations 
        SET conversation_id = gen_random_uuid()::text 
        WHERE conversation_id IS NULL
    """)
    
    # Make it non-nullable
    op.alter_column('agent_conversations', 'conversation_id', nullable=False)
    
    # Add unique constraint and index
    op.create_unique_constraint('uq_agent_conversations_conversation_id', 'agent_conversations', ['conversation_id'])
    op.create_index('ix_agent_conversations_conversation_id', 'agent_conversations', ['conversation_id'])
    
    # Drop old index and create new one with correct name
    op.drop_index('idx_user_updated', table_name='agent_conversations')
    op.create_index('idx_agent_conv_user_updated', 'agent_conversations', ['user_id', 'updated_at'])
    
    # Set default for messages column if not already set
    op.alter_column('agent_conversations', 'messages',
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        server_default='[]',
        existing_nullable=False
    )


def downgrade() -> None:
    # Remove conversation_id column
    op.drop_index('ix_agent_conversations_conversation_id', table_name='agent_conversations')
    op.drop_constraint('uq_agent_conversations_conversation_id', 'agent_conversations', type_='unique')
    op.drop_column('agent_conversations', 'conversation_id')
    
    # Restore old index
    op.drop_index('idx_agent_conv_user_updated', table_name='agent_conversations')
    op.create_index('idx_user_updated', 'agent_conversations', ['user_id', 'updated_at'])
    
    # Remove default from messages
    op.alter_column('agent_conversations', 'messages',
        existing_type=postgresql.JSONB(astext_type=sa.Text()),
        server_default=None,
        existing_nullable=False
    )
