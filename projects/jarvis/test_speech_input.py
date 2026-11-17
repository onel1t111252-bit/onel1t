import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch
import speech_input


class SpeechInputTests(unittest.TestCase):
    def test_without_model_preserves_google_recognition(self):
        recognizer = Mock()
        recognizer.recognize_google.return_value = "  Джарвіс, увімкни Numb  "
        with patch.object(speech_input.Path, "is_file", return_value=False):
            text = speech_input.recognize_speech(recognizer, "audio")
        self.assertEqual(text, "Джарвіс, увімкни Numb")
        recognizer.recognize_google.assert_called_once_with("audio", language="uk-UA")

    def test_local_success_and_silence_never_send_audio_online(self):
        for transcript in ("Джарвіс, увімкни Numb у Spotify", ""):
            recognizer = Mock()
            with patch.object(speech_input.Path, "is_file", return_value=True), patch.object(
                    speech_input, "_transcribe_local", return_value=transcript):
                self.assertEqual(speech_input.recognize_speech(recognizer, "audio"), transcript)
            recognizer.recognize_google.assert_not_called()

    def test_local_failure_announces_fallback(self):
        recognizer, notice = Mock(), Mock()
        recognizer.recognize_google.return_value = "відкрий YouTube"
        with patch.object(speech_input.Path, "is_file", return_value=True), patch.object(
                speech_input, "_transcribe_local", side_effect=RuntimeError("missing library")):
            self.assertEqual(speech_input.recognize_speech(recognizer, "audio", notice),
                             "відкрий YouTube")
        notice.assert_called_once()
        recognizer.recognize_google.assert_called_once()

    def test_local_keeps_title_and_filters_low_confidence_noise(self):
        audio, model = Mock(), Mock()
        audio.get_wav_data.return_value = b"test wav"
        model.transcribe.return_value = (iter([
            SimpleNamespace(text="Джарвіс, увімкни", no_speech_prob=.01, avg_logprob=-.1),
            SimpleNamespace(text="Jane! The Long Faces", no_speech_prob=.02, avg_logprob=-.2),
            SimpleNamespace(text="noise", no_speech_prob=.9, avg_logprob=-2),
        ]), None)
        with patch.object(speech_input, "_local_model", return_value=model):
            self.assertEqual(speech_input._transcribe_local(audio),
                             "Джарвіс, увімкни Jane! The Long Faces")
        audio.get_wav_data.assert_called_once_with(convert_rate=16000, convert_width=2)
        options = model.transcribe.call_args.kwargs
        self.assertEqual(options["language"], "uk")
        self.assertTrue(options["vad_filter"])
        self.assertFalse(options["condition_on_previous_text"])


if __name__ == "__main__":
    unittest.main()
