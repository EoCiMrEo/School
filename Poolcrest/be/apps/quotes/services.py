"""Utility services for the quotes domain."""

from __future__ import annotations

from typing import Iterable, Optional

from django.db import transaction
from django.utils import timezone

from apps.users.models import UserProfile

from .models import Quote


def attach_guest_quotes_to_profile(profile: UserProfile, email: Optional[str] = None) -> int:
    """Attach previously anonymous quotes (matched by email) to a user profile.

    Returns the number of quotes attached. This is idempotent and safe to run
    on every login/registration to ensure guest quotes follow the user once an
    account exists.
    """
    if not profile or not isinstance(profile, UserProfile):
        return 0

    candidate_email = (email or getattr(profile.user, "email", "") or "").strip().lower()
    if not candidate_email:
        return 0

    quotes = Quote.objects.filter(
        customer__isnull=True,
        contact_email__iexact=candidate_email,
        is_deleted=False,
    )

    if not quotes.exists():
        return 0

    now = timezone.now()
    attached = 0

    with transaction.atomic():
        for quote in quotes.select_for_update():
            quote.customer = profile
            # Preserve guest contact metadata while backfilling any missing details.
            if not quote.contact_first_name:
                quote.contact_first_name = getattr(profile.user, "first_name", "") or profile.full_name
            if not quote.contact_last_name:
                quote.contact_last_name = getattr(profile.user, "last_name", "")
            if not quote.contact_phone and getattr(profile, "phone", None):
                quote.contact_phone = profile.phone
            quote.updated_by = profile.user
            quote.updated_at = now
            quote.save(update_fields=[
                "customer",
                "contact_first_name",
                "contact_last_name",
                "contact_phone",
                "updated_by",
                "updated_at",
            ])
            attached += 1

    return attached
