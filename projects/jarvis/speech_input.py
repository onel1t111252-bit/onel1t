"""Local Ukrainian/mixed-title STT, with the existing Google route as fallback.

Audio stays in memory. Models are downloaded only by the explicit installer.
Never use an LLM to invent or rewrite a recognized song title.
"""
from functools import lru_cache
import io
import logging
from pathlib import Path

MODEL_DIR = Path(__file__).resolve().parent / "models" / "whisper-small"


@lru_cache(maxsize=1)
def _local_model():
    from faster_whisper import WhisperModel
    return WhisperModel(str(MODEL_DIR), device="cpu", compute_type="int8",
                        cpu_threads=4, local_files_only=True)


def _transcribe_local(audio):
    model = _local_model()
    wav = io.BytesIO(audio.get_wav_data(convert_rate=16000, convert_width=2))
    segments, _ = model.transcribe(
        wav, language="uk", task="transcribe", beam_size=5,
        temperature=0, condition_on_previous_text=False, vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 700},
        # Vocabulary only; no song examples that could bias the requested title.
        initial_prompt="Українські голосові команди. Джарвіс, YouTube, Spotify, Steam.",
    )
    return " ".join(segment.text.strip() for segment in segments
                    if segment.no_speech_prob < .6 and segment.avg_logprob > -1.0).strip()


def recognize_speech(recognizer, audio, notice=None):
    if (MODEL_DIR / "model.bin").is_file():
        try:
            # An empty local transcript is silence, not a reason to send it online.
            return _transcribe_local(audio)
        except Exception as exc:
            logging.warning("Local speech recognition unavailable: %s", type(exc).__name__)
            if notice:
                notice("Whisper недоступний. Тимчасово використовую Google Speech; "
                       "запусти INSTALL_SPEECH.bat для відновлення.")
    return recognizer.recognize_google(audio, language="uk-UA").strip()


def install_model():
    from faster_whisper.utils import download_model
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    download_model("small", output_dir=str(MODEL_DIR))
    _local_model.cache_clear()
    _local_model()  # Validate that the model actually loads before reporting success.
    print("Whisper small ready. Restart JARVIS to enable local speech recognition.")


if __name__ == "__main__":
    import sys
    if sys.argv[1:] != ["--install"]:
        raise SystemExit("Usage: python speech_input.py --install")
    install_model()
