"""
Raktio Runtime — Event Bridge

Normalizes raw OASIS runtime output (SQLite) into product-facing
SimulationEvent objects for the Simulation Canvas, reports, and compare.

Data sources (verified against real OASIS v0.2.5 SQLite schema):

  PRIMARY SOURCE:
    trace(user_id, created_at, action, info)
      - Records EVERY agent action with structured JSON info
      - Action types: sign_up, create_post, create_comment, like_post,
        unlike_post, dislike_post, follow, unfollow, mute, unmute,
        repost, quote_post, search_posts, search_user, report_post,
        refresh, do_nothing, ...
      - info is a JSON string with action-specific payload

  CONTENT TABLES:
    post(post_id, user_id, original_post_id, content, quote_content,
         created_at, num_likes, num_dislikes, num_shares, num_reports)
    comment(comment_id, post_id, user_id, content, created_at,
            num_likes, num_dislikes)

  REACTION TABLES:
    [like](like_id, user_id, post_id, created_at)         -- SQL reserved word!
    dislike(dislike_id, user_id, post_id, created_at)
    comment_like(comment_like_id, user_id, comment_id, created_at)
    comment_dislike(comment_dislike_id, user_id, comment_id, created_at)

  RELATIONSHIP TABLES:
    follow(follow_id, follower_id, followee_id, created_at)
    mute(mute_id, muter_id, mutee_id, created_at)

  IDENTITY TABLE:
    user(user_id, agent_id, user_name, name, bio, created_at,
         num_followings, num_followers)

  EXPOSURE TABLE:
    rec(user_id, post_id)
"""

from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Optional


@dataclass
class SimulationEvent:
    """Normalized product-facing event from OASIS runtime."""
    event_id: str
    event_type: str
    simulated_time: str
    agent_username: str
    agent_id: Optional[str] = None
    related_agent_username: Optional[str] = None
    platform: str = "x"
    content: Optional[str] = None
    sentiment: Optional[str] = None
    metadata: dict[str, Any] = field(default_factory=dict)
    recorded_at: Optional[str] = None


# ── User mapping cache ─────────────────────────────────────────────────

def _load_user_map(conn: sqlite3.Connection) -> dict[int, dict[str, Any]]:
    """
    Load OASIS user table into a dict keyed by user_id.
    Maps OASIS integer user_id → {user_name, name, agent_id}.
    """
    cur = conn.cursor()
    cur.execute("SELECT user_id, agent_id, user_name, name FROM user")
    return {
        row[0]: {"user_name": row[2], "name": row[3], "agent_id": row[1]}
        for row in cur.fetchall()
    }


def _username_for(user_map: dict, user_id: int) -> str:
    """Resolve OASIS user_id to username, or fallback to string."""
    entry = user_map.get(user_id)
    return entry["user_name"] if entry else str(user_id)


# ── Trace-based event reading ──────────────────────────────────────────

# Actions we normalize into product events.
# Excludes: sign_up (setup), refresh (internal), do_nothing (no-op)
_TRACE_ACTION_MAP = {
    "create_post":         "post_created",
    "create_comment":      "comment_created",
    "like_post":           "post_liked",
    "unlike_post":         "post_unliked",
    "dislike_post":        "post_disliked",
    "undo_dislike_post":   "post_undisliked",
    "like_comment":        "comment_liked",
    "unlike_comment":      "comment_unliked",
    "dislike_comment":     "comment_disliked",
    "undo_dislike_comment":"comment_undisliked",
    "follow":              "follow_created",
    "unfollow":            "follow_removed",
    "mute":                "mute_created",
    "unmute":              "mute_removed",
    "repost":              "repost_created",
    "quote_post":          "quote_created",
    "search_posts":        "search_performed",
    "search_user":         "user_searched",
    "trend":               "trend_checked",
    "report_post":         "post_reported",
}


def read_events_from_trace(
    sqlite_path: str,
    since_rowid: int = 0,
    limit: int = 100,
) -> list[SimulationEvent]:
    """
    Read and normalize events from a run's trace table (primary source).

    Args:
        sqlite_path: Path to the run's SQLite DB
        since_rowid: Only return trace rows after this rowid
        limit: Max events to return

    Returns:
        List of normalized SimulationEvent objects.
    """
    db_path = Path(sqlite_path)
    if not db_path.exists():
        return []

    events: list[SimulationEvent] = []

    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        user_map = _load_user_map(conn)
        cur = conn.cursor()

        cur.execute(
            "SELECT rowid, user_id, created_at, action, info "
            "FROM trace WHERE rowid > ? ORDER BY rowid LIMIT ?",
            (since_rowid, limit),
        )

        for row in cur.fetchall():
            action = row["action"]
            event_type = _TRACE_ACTION_MAP.get(action)
            if not event_type:
                continue  # skip internal actions (sign_up, refresh, do_nothing)

            # Parse info JSON
            info = {}
            try:
                info = json.loads(row["info"]) if row["info"] else {}
            except json.JSONDecodeError:
                pass

            username = _username_for(user_map, row["user_id"])

            # Build metadata from info
            metadata: dict[str, Any] = {"trace_rowid": row["rowid"]}

            # Extract content for content-creation events
            content = None
            if action in ("create_post", "create_comment", "quote_post"):
                content = info.get("content", "")

            # Extract related entity IDs
            if "post_id" in info:
                metadata["post_id"] = info["post_id"]
            if "comment_id" in info:
                metadata["comment_id"] = info["comment_id"]
            if "like_id" in info:
                metadata["like_id"] = info["like_id"]

            # Resolve related agent for relationship events
            related_username = None
            if action in ("follow", "unfollow"):
                followee_id = info.get("followee_id")
                if followee_id is not None:
                    related_username = _username_for(user_map, followee_id)
            elif action in ("mute", "unmute"):
                mutee_id = info.get("mutee_id")
                if mutee_id is not None:
                    related_username = _username_for(user_map, mutee_id)

            events.append(SimulationEvent(
                event_id=f"trace_{row['rowid']}",
                event_type=event_type,
                simulated_time="",
                agent_username=username,
                related_agent_username=related_username,
                content=content,
                metadata=metadata,
                recorded_at=row["created_at"],
            ))

        conn.close()

    except sqlite3.OperationalError as exc:
        pass  # DB might not exist yet during bootstrap

    return events


# ── Content table readers (for enriched data) ──────────────────────────

def read_posts(sqlite_path: str) -> list[dict[str, Any]]:
    """Read all posts with enriched metadata (likes, shares, etc.)."""
    db_path = Path(sqlite_path)
    if not db_path.exists():
        return []

    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        user_map = _load_user_map(conn)
        cur = conn.cursor()

        cur.execute(
            "SELECT post_id, user_id, original_post_id, content, quote_content, "
            "created_at, num_likes, num_dislikes, num_shares, num_reports "
            "FROM post ORDER BY post_id"
        )

        posts = []
        for row in cur.fetchall():
            posts.append({
                "post_id": row["post_id"],
                "user_id": row["user_id"],
                "username": _username_for(user_map, row["user_id"]),
                "content": row["content"],
                "quote_content": row["quote_content"],
                "original_post_id": row["original_post_id"],
                "num_likes": row["num_likes"],
                "num_dislikes": row["num_dislikes"],
                "num_shares": row["num_shares"],
                "num_reports": row["num_reports"],
                "created_at": row["created_at"],
            })

        conn.close()
        return posts

    except sqlite3.OperationalError:
        return []


def read_comments(sqlite_path: str) -> list[dict[str, Any]]:
    """Read all comments with enriched metadata."""
    db_path = Path(sqlite_path)
    if not db_path.exists():
        return []

    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        user_map = _load_user_map(conn)
        cur = conn.cursor()

        cur.execute(
            "SELECT comment_id, post_id, user_id, content, created_at, "
            "num_likes, num_dislikes FROM comment ORDER BY comment_id"
        )

        comments = []
        for row in cur.fetchall():
            comments.append({
                "comment_id": row["comment_id"],
                "post_id": row["post_id"],
                "user_id": row["user_id"],
                "username": _username_for(user_map, row["user_id"]),
                "content": row["content"],
                "num_likes": row["num_likes"],
                "num_dislikes": row["num_dislikes"],
                "created_at": row["created_at"],
            })

        conn.close()
        return comments

    except sqlite3.OperationalError:
        return []


# ── Exposure / recommendation data ─────────────────────────────────────

def read_exposure(sqlite_path: str) -> list[dict[str, Any]]:
    """
    Read the rec table — which posts were recommended to which users.
    Used for exposure_analysis report section.
    """
    db_path = Path(sqlite_path)
    if not db_path.exists():
        return []

    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        user_map = _load_user_map(conn)
        cur = conn.cursor()

        cur.execute("SELECT user_id, post_id FROM rec")
        recs = []
        for row in cur.fetchall():
            recs.append({
                "user_id": row["user_id"],
                "username": _username_for(user_map, row["user_id"]),
                "post_id": row["post_id"],
            })

        conn.close()
        return recs

    except sqlite3.OperationalError:
        return []


# ── Aggregate counts ───────────────────────────────────────────────────

def get_event_counts(sqlite_path: str) -> dict[str, int]:
    """Get counts of each entity type from a run's SQLite DB."""
    db_path = Path(sqlite_path)
    if not db_path.exists():
        return {}

    counts = {}
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Note: `like` is a SQL reserved word — must be quoted
        tables = {
            "post": "post",
            "comment": "comment",
            "like": "[like]",       # quoted!
            "dislike": "dislike",
            "follow": "follow",
            "mute": "mute",
            "report": "report",
            "trace": "trace",
            "rec": "rec",
            "comment_like": "comment_like",
            "comment_dislike": "comment_dislike",
        }

        for name, sql_name in tables.items():
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {sql_name}")
                counts[name] = cursor.fetchone()[0]
            except sqlite3.OperationalError:
                counts[name] = 0

        conn.close()
    except sqlite3.OperationalError:
        pass

    return counts


def get_trace_action_summary(sqlite_path: str) -> dict[str, int]:
    """Count occurrences of each trace action type."""
    db_path = Path(sqlite_path)
    if not db_path.exists():
        return {}

    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        cursor.execute(
            "SELECT action, COUNT(*) as cnt FROM trace "
            "GROUP BY action ORDER BY cnt DESC"
        )
        summary = {row[0]: row[1] for row in cursor.fetchall()}
        conn.close()
        return summary
    except sqlite3.OperationalError:
        return {}


# ── Belief shift indicators ────────────────────────────────────────────

def compute_belief_shift_indicators(sqlite_path: str) -> dict[str, Any]:
    """
    Compute per-agent behavioral indicators that signal stance/belief shifts.

    Returns:
        Dict keyed by username with:
        - reaction_ratio: likes / (likes + dislikes) for posts they reacted to
        - engagement_targets: who they interact with most (comments + likes)
        - content_actions: count of create_post, create_comment, like, dislike
        - behavioral_stance: inferred from reaction patterns
          ("positive" if mostly likes, "negative" if mostly dislikes,
           "mixed" if both, "passive" if mostly lurking)
    """
    db_path = Path(sqlite_path)
    if not db_path.exists():
        return {}

    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        user_map = _load_user_map(conn)
        cur = conn.cursor()

        indicators: dict[str, dict[str, Any]] = {}

        # Per-agent action counts
        cur.execute(
            "SELECT user_id, action, COUNT(*) as cnt FROM trace "
            "WHERE action NOT IN ('refresh', 'sign_up') "
            "GROUP BY user_id, action"
        )
        agent_actions: dict[int, dict[str, int]] = {}
        for row in cur.fetchall():
            uid = row["user_id"]
            if uid not in agent_actions:
                agent_actions[uid] = {}
            agent_actions[uid][row["action"]] = row["cnt"]

        for uid, actions in agent_actions.items():
            username = _username_for(user_map, uid)
            likes = actions.get("like_post", 0) + actions.get("like_comment", 0)
            dislikes = actions.get("dislike_post", 0) + actions.get("dislike_comment", 0)
            creates = actions.get("create_post", 0) + actions.get("create_comment", 0)
            total_reactions = likes + dislikes

            # Infer behavioral stance from reaction pattern
            if total_reactions == 0:
                if creates > 0:
                    behavioral_stance = "expressive"
                else:
                    behavioral_stance = "passive"
            elif dislikes == 0:
                behavioral_stance = "positive"
            elif likes == 0:
                behavioral_stance = "negative"
            else:
                behavioral_stance = "mixed"

            indicators[username] = {
                "likes_given": likes,
                "dislikes_given": dislikes,
                "content_created": creates,
                "reaction_ratio": round(likes / total_reactions, 2) if total_reactions > 0 else None,
                "behavioral_stance": behavioral_stance,
                "total_actions": sum(actions.values()),
            }

        # Engagement targets: who commented/liked whose posts
        cur.execute("""
            SELECT c.user_id as commenter, p.user_id as poster, COUNT(*) as cnt
            FROM comment c JOIN post p ON c.post_id = p.post_id
            WHERE c.user_id != p.user_id
            GROUP BY c.user_id, p.user_id
        """)
        for row in cur.fetchall():
            commenter = _username_for(user_map, row["commenter"])
            poster = _username_for(user_map, row["poster"])
            if commenter in indicators:
                if "engagement_targets" not in indicators[commenter]:
                    indicators[commenter]["engagement_targets"] = {}
                indicators[commenter]["engagement_targets"][poster] = row["cnt"]

        conn.close()
        return indicators

    except sqlite3.OperationalError:
        return {}


# ── Exposure history (from refresh traces) ─────────────────────────────

def compute_exposure_history(sqlite_path: str) -> dict[str, Any]:
    """
    Build per-agent exposure history from trace refresh events.

    The `refresh` trace action's info JSON contains the list of posts
    each agent saw at each step. This is richer than the rec table
    (which is just the current snapshot).

    Returns:
        Dict with:
        - per_agent: {username: {posts_seen: [ids], exposure_count: N, unique_posts: N}}
        - per_post: {post_id: {exposed_to: [usernames], exposure_count: N}}
    """
    db_path = Path(sqlite_path)
    if not db_path.exists():
        return {"per_agent": {}, "per_post": {}}

    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        user_map = _load_user_map(conn)
        cur = conn.cursor()

        per_agent: dict[str, dict[str, Any]] = {}
        per_post: dict[int, dict[str, Any]] = {}

        cur.execute("SELECT user_id, info FROM trace WHERE action = 'refresh'")
        for row in cur.fetchall():
            username = _username_for(user_map, row["user_id"])
            try:
                info = json.loads(row["info"]) if row["info"] else {}
            except json.JSONDecodeError:
                continue

            posts = info.get("posts", [])
            post_ids = [p["post_id"] for p in posts if "post_id" in p]

            if username not in per_agent:
                per_agent[username] = {"posts_seen": set(), "exposure_count": 0}
            per_agent[username]["posts_seen"].update(post_ids)
            per_agent[username]["exposure_count"] += len(post_ids)

            for pid in post_ids:
                if pid not in per_post:
                    per_post[pid] = {"exposed_to": set(), "exposure_count": 0}
                per_post[pid]["exposed_to"].add(username)
                per_post[pid]["exposure_count"] += 1

        conn.close()

        # Convert sets to lists for JSON serialization
        for username, data in per_agent.items():
            data["posts_seen"] = sorted(data["posts_seen"])
            data["unique_posts"] = len(data["posts_seen"])

        for pid, data in per_post.items():
            data["exposed_to"] = sorted(data["exposed_to"])

        return {"per_agent": per_agent, "per_post": per_post}

    except sqlite3.OperationalError:
        return {"per_agent": {}, "per_post": {}}


# ── Interaction matrix (for faction analysis) ──────────────────────────

def compute_interaction_matrix(sqlite_path: str) -> dict[str, Any]:
    """
    Build an interaction matrix showing who interacts with whom.

    Sources: comments on posts, likes on posts, follows, mutes.

    Returns:
        Dict with:
        - comment_interactions: [{from, to, count}]
        - like_interactions: [{from, to, count}]
        - follow_edges: [{follower, followee}]
        - mute_edges: [{muter, mutee}]
        - interaction_summary: {agent: {interacted_with: [agents], total_interactions: N}}
    """
    db_path = Path(sqlite_path)
    if not db_path.exists():
        return {}

    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        user_map = _load_user_map(conn)
        cur = conn.cursor()

        # Comment interactions (who commented on whose posts)
        comment_interactions = []
        cur.execute("""
            SELECT c.user_id as commenter, p.user_id as poster, COUNT(*) as cnt
            FROM comment c JOIN post p ON c.post_id = p.post_id
            GROUP BY c.user_id, p.user_id
        """)
        for row in cur.fetchall():
            comment_interactions.append({
                "from": _username_for(user_map, row["commenter"]),
                "to": _username_for(user_map, row["poster"]),
                "count": row["cnt"],
                "type": "comment",
            })

        # Like interactions (who liked whose posts)
        like_interactions = []
        cur.execute("""
            SELECT l.user_id as liker, p.user_id as poster, COUNT(*) as cnt
            FROM [like] l JOIN post p ON l.post_id = p.post_id
            GROUP BY l.user_id, p.user_id
        """)
        for row in cur.fetchall():
            like_interactions.append({
                "from": _username_for(user_map, row["liker"]),
                "to": _username_for(user_map, row["poster"]),
                "count": row["cnt"],
                "type": "like",
            })

        # Follow edges
        follow_edges = []
        cur.execute("SELECT follower_id, followee_id FROM follow")
        for row in cur.fetchall():
            follow_edges.append({
                "follower": _username_for(user_map, row["follower_id"]),
                "followee": _username_for(user_map, row["followee_id"]),
            })

        # Mute edges
        mute_edges = []
        cur.execute("SELECT muter_id, mutee_id FROM mute")
        for row in cur.fetchall():
            mute_edges.append({
                "muter": _username_for(user_map, row["muter_id"]),
                "mutee": _username_for(user_map, row["mutee_id"]),
            })

        # Build interaction summary per agent
        interaction_summary: dict[str, dict[str, Any]] = {}
        all_interactions = comment_interactions + like_interactions
        for inter in all_interactions:
            agent = inter["from"]
            target = inter["to"]
            if agent not in interaction_summary:
                interaction_summary[agent] = {"interacted_with": set(), "total_interactions": 0}
            interaction_summary[agent]["interacted_with"].add(target)
            interaction_summary[agent]["total_interactions"] += inter["count"]

        for agent, data in interaction_summary.items():
            data["interacted_with"] = sorted(data["interacted_with"])

        conn.close()

        return {
            "comment_interactions": comment_interactions,
            "like_interactions": like_interactions,
            "follow_edges": follow_edges,
            "mute_edges": mute_edges,
            "interaction_summary": interaction_summary,
        }

    except sqlite3.OperationalError:
        return {}


# ── Runtime evidence bundle (for reports) ──────────────────────────────

def build_evidence_bundle(sqlite_path: str) -> dict[str, Any]:
    """
    Build a comprehensive evidence bundle from a completed run.
    Used by report_service to generate evidence-backed reports.

    Returns a dict with all runtime data needed for report generation.
    This is the handoff point between runtime and intelligence layer.
    """
    counts = get_event_counts(sqlite_path)
    action_summary = get_trace_action_summary(sqlite_path)
    posts = read_posts(sqlite_path)
    comments = read_comments(sqlite_path)
    exposure = read_exposure(sqlite_path)

    # Top posts by engagement
    top_posts = sorted(
        posts,
        key=lambda p: (p.get("num_likes", 0) + p.get("num_shares", 0)),
        reverse=True,
    )[:10]

    # Per-agent action counts from trace
    agent_activity: dict[str, dict[str, int]] = {}
    db_path = Path(sqlite_path)
    if db_path.exists():
        try:
            conn = sqlite3.connect(str(db_path))
            conn.row_factory = sqlite3.Row
            user_map = _load_user_map(conn)
            cur = conn.cursor()
            cur.execute(
                "SELECT user_id, action, COUNT(*) as cnt FROM trace "
                "WHERE action != 'refresh' AND action != 'sign_up' "
                "GROUP BY user_id, action"
            )
            for row in cur.fetchall():
                username = _username_for(user_map, row["user_id"])
                if username not in agent_activity:
                    agent_activity[username] = {}
                agent_activity[username][row["action"]] = row["cnt"]
            conn.close()
        except sqlite3.OperationalError:
            pass

    # Belief shift indicators (per-agent behavioral stance metrics)
    belief_indicators = compute_belief_shift_indicators(sqlite_path)

    # Exposure history (from refresh traces — richer than rec table)
    exposure_history = compute_exposure_history(sqlite_path)

    # Interaction matrix (for faction analysis)
    interaction_matrix = compute_interaction_matrix(sqlite_path)

    return {
        "event_counts": counts,
        "action_summary": action_summary,
        "total_posts": len(posts),
        "total_comments": len(comments),
        "total_trace_events": counts.get("trace", 0),
        "top_posts": top_posts,
        "sample_comments": comments[:20],
        "exposure_records": len(exposure),
        "agent_activity": agent_activity,
        "posts": posts,
        "comments": comments,
        "belief_indicators": belief_indicators,
        "exposure_history": exposure_history,
        "interaction_matrix": interaction_matrix,
    }
