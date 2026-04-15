try:
    from importlib.metadata import version, PackageNotFoundError

    __version__ = version("orbit-ml")
except PackageNotFoundError:
    __version__ = "unknown"
