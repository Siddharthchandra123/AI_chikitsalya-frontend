"""
AI Chikitsalya - Medical Image Analyzer

Low-cost image analysis module.

The analyzer:
- Accepts common medical image formats.
- Uses an optional Hugging Face image-classification model.
- Falls back gracefully if the model is unavailable.
- Returns a label + confidence compatible with api.py.
- Does NOT claim a confirmed medical diagnosis.

IMPORTANT:
This module is intended for screening/decision-support prototypes.
It is not a clinically validated diagnostic system.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Tuple

from PIL import Image

try:
    import torch
except ImportError:
    torch = None

try:
    from transformers import (
        AutoImageProcessor,
        AutoModelForImageClassification,
    )
except ImportError:
    AutoImageProcessor = None
    AutoModelForImageClassification = None


logger = logging.getLogger("ai_chikitsalya.image_analyzer")


class ImageAnalyzer:
    """
    Generic medical image analyzer.

    Configure a suitable image-classification model using:

        IMAGE_MODEL_NAME=<huggingface-model>

    If no model is configured, the analyzer returns a safe
    'analysis unavailable' result instead of making a fabricated
    prediction.
    """

    def __init__(self):

        self.model_name = os.getenv(
            "IMAGE_MODEL_NAME",
            "",
        ).strip()

        self.processor = None
        self.model = None

        self.loaded = False

        if self.model_name:
            self._load_model()
        else:
            logger.info(
                "IMAGE_MODEL_NAME not configured. "
                "Image AI is disabled."
            )

    # ============================================================
    # MODEL LOADING
    # ============================================================

    def _load_model(self) -> None:

        if (
            AutoImageProcessor is None
            or AutoModelForImageClassification is None
        ):
            logger.warning(
                "transformers is not installed. "
                "Image AI disabled."
            )
            return

        if torch is None:
            logger.warning(
                "PyTorch is not installed. "
                "Image AI disabled."
            )
            return

        try:

            logger.info(
                "Loading image model: %s",
                self.model_name,
            )

            self.processor = AutoImageProcessor.from_pretrained(
                self.model_name
            )

            self.model = AutoModelForImageClassification.from_pretrained(
                self.model_name
            )

            self.model.eval()

            self.loaded = True

            logger.info(
                "Medical image model loaded successfully."
            )

        except Exception as exc:

            logger.exception(
                "Could not load image model: %s",
                exc
            )

            self.processor = None
            self.model = None
            self.loaded = False

    # ============================================================
    # IMAGE VALIDATION
    # ============================================================

    @staticmethod
    def _validate_image(path: str) -> Image.Image:

        file_path = Path(path)

        if not file_path.exists():
            raise FileNotFoundError(
                f"Image not found: {path}"
            )

        allowed_extensions = {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
        }

        if file_path.suffix.lower() not in allowed_extensions:
            raise ValueError(
                "Unsupported image format."
            )

        image = Image.open(file_path)

        # Convert to RGB because most vision models expect RGB.
        return image.convert("RGB")

    # ============================================================
    # IMAGE PREDICTION
    # ============================================================

    def analyze(self, path: str) -> Tuple[str, float]:

        try:

            image = self._validate_image(path)

        except Exception as exc:

            logger.warning(
                "Image validation failed: %s",
                exc
            )

            return (
                "Image could not be processed",
                0.0,
            )

        # --------------------------------------------------------
        # No model configured
        # --------------------------------------------------------

        if not self.loaded:

            return (
                "Image analysis unavailable",
                0.0,
            )

        try:

            inputs = self.processor(
                images=image,
                return_tensors="pt",
            )

            with torch.no_grad():

                outputs = self.model(
                    **inputs
                )

            probabilities = torch.softmax(
                outputs.logits,
                dim=-1,
            )[0]

            confidence, class_index = torch.max(
                probabilities,
                dim=0,
            )

            confidence_value = float(
                confidence.item()
            )

            index = int(
                class_index.item()
            )

            # Hugging Face models normally expose id2label.
            label = self.model.config.id2label.get(
                index,
                f"class_{index}",
            )

            return (
                str(label),
                round(confidence_value, 4),
            )

        except Exception as exc:

            logger.exception(
                "Image inference failed: %s",
                exc
            )

            return (
                "Image analysis failed",
                0.0,
            )

    # ============================================================
    # STRUCTURED ANALYSIS
    # ============================================================

    def analyze_detailed(self, path: str) -> dict:

        label, confidence = self.analyze(path)

        if confidence <= 0:

            return {
                "status": "unavailable",
                "prediction": label,
                "confidence": 0.0,
                "is_screening": True,
                "disclaimer": (
                    "The image could not be reliably analyzed."
                ),
            }

        if confidence >= 0.80:
            confidence_label = "high"
        elif confidence >= 0.60:
            confidence_label = "moderate"
        else:
            confidence_label = "low"

        return {
            "status": "success",
            "prediction": label,
            "confidence": confidence,
            "confidence_label": confidence_label,
            "is_screening": True,
            "disclaimer": (
                "This is an AI-assisted image screening result "
                "and is not a confirmed medical diagnosis."
            ),
        }
