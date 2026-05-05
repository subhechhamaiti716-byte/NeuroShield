import logging
import sys

LOG_FORMAT = "%(asctime)s - %(levelname)s - %(name)s - %(message)s"

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("neuroshield.log")
    ]
)

def get_logger(name: str):
    return logging.getLogger(name)
