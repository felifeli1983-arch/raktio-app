import json
from pathlib import Path

import cmdstanpy
from ..utils.logger import get_logger

logger = get_logger("orbit")

_ORBIT_DIR = Path(__file__).parent.parent


def set_cmdstan_path():
    with open(_ORBIT_DIR / "config.json") as f:
        config = json.load(f)
    CMDSTAN_VERSION = config["CMDSTAN_VERSION"]

    local_cmdstan = _ORBIT_DIR / "stan_compiled" / f"cmdstan-{CMDSTAN_VERSION}"
    if local_cmdstan.exists():
        cmdstanpy.set_cmdstan_path(str(local_cmdstan))
        logger.debug(
            f"Local/repackaged cmdstan exists, setting path to {str(local_cmdstan)}"
        )
        return 1
    logger.debug(
        f"Cannot find local cmdstan in {str(local_cmdstan)}, using default path at ~/.cmdstan."
    )
    return 1
