"""
JACRAL – Pagination utilities.
"""
import math
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginationParams:
    """Dependency-injectable pagination parameters."""

    def __init__(self, page: int = 1, limit: int = 20):
        self.page = max(1, page)
        self.limit = min(max(1, limit), 100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    page: int
    limit: int
    total: int
    pages: int

    @classmethod
    def build(cls, items: list, total: int, pagination: PaginationParams):
        pages = math.ceil(total / pagination.limit) if total > 0 else 0
        return cls(
            items=items,
            page=pagination.page,
            limit=pagination.limit,
            total=total,
            pages=pages,
        )
