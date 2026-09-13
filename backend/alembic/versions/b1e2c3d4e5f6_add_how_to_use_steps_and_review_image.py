"""add how to use steps and review image

Revision ID: b1e2c3d4e5f6
Revises: 9a1c84f50123
Create Date: 2026-09-08 17:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1e2c3d4e5f6'
down_revision: Union[str, None] = '9a1c84f50123'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    
    # 1. how_to_use_steps
    if 'how_to_use_steps' not in insp.get_table_names():
        op.create_table(
            'how_to_use_steps',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('step_number', sa.Integer(), nullable=False),
            sa.Column('title', sa.String(length=200), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('image_url', sa.String(length=500), nullable=True),
            sa.Column('sort_order', sa.Integer(), server_default='1', nullable=False),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_how_to_use_steps_id'), 'how_to_use_steps', ['id'], unique=False)

    # 2. Add customer_image_url to customer_reviews if not exists
    rev_cols = [c['name'] for c in insp.get_columns('customer_reviews')]
    if 'customer_image_url' not in rev_cols:
        op.add_column('customer_reviews', sa.Column('customer_image_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    rev_cols = [c['name'] for c in insp.get_columns('customer_reviews')]
    if 'customer_image_url' in rev_cols:
        op.drop_column('customer_reviews', 'customer_image_url')

    if 'how_to_use_steps' in insp.get_table_names():
        op.drop_index(op.f('ix_how_to_use_steps_id'), table_name='how_to_use_steps')
        op.drop_table('how_to_use_steps')
