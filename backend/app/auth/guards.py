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
    Decode and verify a Supabase-issued JWT.
    Supabase signs tokens with HS256 using SUPABASE_JWT_SECRET.
    Found in: Supabase Dashboard → Settings → API → JWT Settings.
    """
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server auth configuration error: JWT secret not configured",
        )
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase JWTs may omit audience
        )
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
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
    Dependency: require a valid JWT.
    Full platform_admin role check is performed inside admin service
    via DB lookup on workspace_memberships (not in JWT claims).
    TODO: add DB role lookup when admin service is implemented.
    """
    return require_user(credentials)


async def require_workspace_member(
    workspace_id: uuid.UUID,
    user: AuthUser = Depends(require_user),
) -> WorkspaceContext:
    """
    Dependency: require the caller to be an active workspace member.
    Full DB membership lookup will be wired in when supabase_client is ready.
    TODO: query workspace_memberships via service_role client.
    """
    return WorkspaceContext(
        user=user,
        workspace_id=workspace_id,
        member_role="contributor",  # TODO: resolve from DB
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
