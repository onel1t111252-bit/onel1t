import unittest
from unittest.mock import patch
from voice_engine import speak, VOICE_PROFILES, SpeechResult, clamp_volume, EDGE_TUNING, _cache_put, _cache_get, _SHORT_AUDIO_CACHE

class VoiceTests(unittest.TestCase):
    def test_default_profile_is_male_ukrainian(self):
        self.assertEqual(VOICE_PROFILES[0], "jarvis-cinematic")
        self.assertIn("studio-onyx", VOICE_PROFILES)
    def test_cinematic_pitch_is_less_artificial_than_old_profile(self):
        self.assertEqual(EDGE_TUNING["jarvis-cinematic"][0], "uk-UA-OstapNeural")
        self.assertEqual(EDGE_TUNING["jarvis-cinematic"][2], "-12Hz")
        self.assertEqual(EDGE_TUNING["jarvis-deep"][2], "-19Hz")

    def test_short_speech_cache_only_holds_safe_acknowledgments(self):
        _SHORT_AUDIO_CACHE.clear()
        _cache_put("jarvis-cinematic", "Є, сер.", b"x" * 200)
        self.assertEqual(_cache_get("jarvis-cinematic", "Є, сер."), b"x" * 200)
        _cache_put("jarvis-cinematic", "private dictation", b"p" * 100)
        self.assertIsNone(_cache_get("jarvis-cinematic", "private dictation"))
        _SHORT_AUDIO_CACHE.clear()

    def test_studio_requires_user_supplied_api_key(self):
        with patch.dict("voice_engine.os.environ", {}, clear=True):
            with patch.dict("sys.modules", {"pygame": type("Fake", (), {})()}):
                result = speak("Так, сер.", "studio-onyx")
        self.assertFalse(result.ok)
        self.assertIn("OPENAI_API_KEY", result.detail)

    def test_unknown_profile_refused(self):
        self.assertFalse(speak("Тест", "not-a-voice").ok)
    def test_windows_profile_is_explicit(self):
        with patch("voice_engine._windows_sapi", return_value=SpeechResult(False, "Недоступний")) as fn:
            self.assertFalse(speak("Тест", "windows").ok)
            fn.assert_called_once_with("Тест", 80)
    def test_clamp_volume(self):
        for value, expected in ((0, 0), (40, 40), (100, 100),
                                (-12, 0), (999, 100), ("bad", 80),
                                (float("nan"), 80), (None, 80)):
            with self.subTest(value=value):
                self.assertEqual(clamp_volume(value), expected)
    def test_zero_volume_skips_online_voice(self):
        self.assertTrue(speak("Тест", "jarvis-deep", 0).ok)
    def test_local_voice_receives_selected_volume(self):
        with patch("voice_engine._windows_sapi", return_value=SpeechResult(True)) as fn:
            self.assertTrue(speak("Тест", "windows", 35).ok)
            fn.assert_called_once_with("Тест", 35)
    def test_empty_text_does_not_contact_service(self):
        self.assertTrue(speak("  ", "jarvis-deep").ok)

if __name__ == "__main__":
    unittest.main()
