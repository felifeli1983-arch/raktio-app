"""
Raktio — Auth Guards
FastAPI dependencies for JWT validation via Supabase.

Usage in route handlers:
    from app.auth.guards import require_user, require_workspace_member

    @router.get("/simulations")
    async def list_simulations(
        current_user: AuthUser = Depends(require_user),
    ): ...

How Supabase JWT auth works in this backend:
  1. Frontend performs Supabase Auth login → receives access_token (JWT).
  2. Frontend includes it as: Authorization: Bearer <access_token>
  3. This module validates the JWT using python-jose + SUPABASE_JWT_SECRET (HS256).
  4. We extract the sub claim (user UUID) → this maps to public.users.user_id.
  5. The backend uses the service_role key for all DB operations
     (bypasses RLS), but only after confirming the caller is authenticated.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError, jwt

from app.config import settings

_bearer_scheme = HTTPBearer(auto_error=False)


# ── Data classes ────────────────────────────────────────────────────────

@dataclass
class AuthUser:
    """Represents an authenticated caller extracted from the Supabase JWT."""
    user_id: uuid.UUID
    email: Optional[str]
    role: str           # 'authenticated' for normal users


@dataclass
class WorkspaceContext:
    """Authenticated user + the workspace they are operating in."""
    user: AuthUser
    workspace_id: uuid.UUID
    member_role: str    # viewer | contributor | editor | workspace_admin | ...


# ── JWT validation ───────────────────────────────────────────────────────

def _decode_supabase_jwt(token: str) -> dict:
    """
    Validate a Supabase-issued JWT.

    Strategy:
    1. Try local HS256 decode if SUPABASE_JWT_SECRET is configured
    2. Fall back to Supabase auth.getUser() API call (works with ES256/RS256)

    Supabase newer projects may use ES256 (asymmetric) instead of HS256.
    The getUser() fallback handles this transparently.
    """
    # Strategy 1: Local HS256 decode (fast, no network call)
    if settings.supabase_jwt_secret:
        try:
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            return payload
        except (ExpiredSignatureError, JWTError):
            pass  # Fall through to Strategy 2

    # Strategy 2: Verify via Supabase auth.getUser() API
    try:
        from app.db.supabase_client import get_supabase
        sb = get_supabase()
        user_response = sb.auth.get_user(token)
        if user_response and user_response.user:
            return {
                "sub": str(user_response.user.id),
                "email": user_response.user.email,
                "role": "authenticated",
            }
    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _extract_auth_user(credentials: HTTPAuthorizationCredentials) -> AuthUser:
    payload = _decode_supabase_jwt(credentials.credentials)

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
        )
    try:
        user_id = uuid.UUID(sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
        )

    return AuthUser(
        user_id=user_id,
        email=payload.get("email"),
        role=payload.get("role", "authenticated"),
    )


# ── FastAPI dependencies ─────────────────────────────────────────────────

def require_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> AuthUser:
    """
    Dependency: require a valid Supabase JWT.
    Returns AuthUser or raises HTTP 401.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _extract_auth_user(credentials)


def require_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> AuthUser:
    """
    Dependency: require a valid JWT AND platform_admin role.
    Checks workspace_memberships for any membership with role='platform_admin'.
    """
    user = require_user(credentials)

    from app.db.supabase_client import get_supabase
    sb = get_supabase()
    result = (
        sb.table("workspace_memberships")
        .select("role")
        .eq("user_id", str(user.user_id))
        .eq("role", "platform_admin")
        .eq("status", "active")
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform admin access required",
        )
    return user


async def require_workspace_member(
    workspace_id: uuid.UUID,
    user: AuthUser = Depends(require_user),
) -> WorkspaceContext:
    """
    Dependency: require the caller to be an active member of the given workspace.
    Queries workspace_memberships via service_role client (bypasses RLS).
    Returns WorkspaceContext with the actual member role, or raises 403.
    """
    from app.db.supabase_client import get_supabase

    sb = get_supabase()
    result = (
        sb.table("workspace_memberships")
        .select("role")
        .eq("workspace_id", str(workspace_id))
        .eq("user_id", str(user.user_id))
        .eq("status", "active")
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this workspace",
        )

    return WorkspaceContext(
        user=user,
        workspace_id=workspace_id,
        member_role=result.data[0]["role"],
    )


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> Optional[AuthUser]:
    """
    Dependency: return AuthUser if valid token present, else None.
    """
    if credentials is None:
        return None
    try:
        return _extract_auth_user(credentials)
    except HTTPException:
        return None
