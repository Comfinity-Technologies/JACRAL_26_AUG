"""add cms content tables

Revision ID: 9a1c84f50123
Revises: 7c8e73457d01
Create Date: 2026-09-07 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '9a1c84f50123'
down_revision: Union[str, None] = '7c8e73457d01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. website_settings
    op.create_table(
        'website_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('value', sa.Text(), nullable=True),
        sa.Column('draft_value', sa.Text(), nullable=True),
        sa.Column('is_published', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_website_settings_id'), 'website_settings', ['id'], unique=False)
    op.create_index(op.f('ix_website_settings_key'), 'website_settings', ['key'], unique=True)

    # 2. landing_page_slides
    op.create_table(
        'landing_page_slides',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('slide_number', sa.Integer(), server_default='1', nullable=False),
        sa.Column('display_order', sa.Integer(), server_default='1', nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('subtitle', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('cta_text', sa.String(length=100), nullable=True),
        sa.Column('cta_url', sa.String(length=255), nullable=True),
        sa.Column('secondary_cta_text', sa.String(length=100), nullable=True),
        sa.Column('secondary_cta_url', sa.String(length=255), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('mobile_image_url', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('draft_title', sa.String(length=255), nullable=True),
        sa.Column('draft_subtitle', sa.String(length=255), nullable=True),
        sa.Column('draft_description', sa.Text(), nullable=True),
        sa.Column('draft_cta_text', sa.String(length=100), nullable=True),
        sa.Column('draft_cta_url', sa.String(length=255), nullable=True),
        sa.Column('draft_secondary_cta_text', sa.String(length=100), nullable=True),
        sa.Column('draft_secondary_cta_url', sa.String(length=255), nullable=True),
        sa.Column('draft_image_url', sa.String(length=500), nullable=True),
        sa.Column('draft_mobile_image_url', sa.String(length=500), nullable=True),
        sa.Column('draft_is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('is_published', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_landing_page_slides_id'), 'landing_page_slides', ['id'], unique=False)

    # 3. landing_page_sections
    op.create_table(
        'landing_page_sections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('section_key', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('subtitle', sa.String(length=255), nullable=True),
        sa.Column('content', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('draft_content', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('draft_is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('is_published', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_landing_page_sections_id'), 'landing_page_sections', ['id'], unique=False)
    op.create_index(op.f('ix_landing_page_sections_section_key'), 'landing_page_sections', ['section_key'], unique=True)

    # 4. media_assets
    op.create_table(
        'media_assets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('original_name', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_url', sa.String(length=500), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('asset_type', sa.String(length=50), server_default='general', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('uploader_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['uploader_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_media_assets_id'), 'media_assets', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_media_assets_id'), table_name='media_assets')
    op.drop_table('media_assets')

    op.drop_index(op.f('ix_landing_page_sections_section_key'), table_name='landing_page_sections')
    op.drop_index(op.f('ix_landing_page_sections_id'), table_name='landing_page_sections')
    op.drop_table('landing_page_sections')

    op.drop_index(op.f('ix_landing_page_slides_id'), table_name='landing_page_slides')
    op.drop_table('landing_page_slides')

    op.drop_index(op.f('ix_website_settings_key'), table_name='website_settings')
    op.drop_index(op.f('ix_website_settings_id'), table_name='website_settings')
    op.drop_table('website_settings')
