import unittest
from unittest.mock import patch
from voice_engine import speak, VOICE_PROFILES, SpeechResult

class VoiceTests(unittest.TestCase):
    def test_default_profile_is_male_ukrainian(self):
        self.assertEqual(VOICE_PROFILES[0], "jarvis-deep")
    def test_unknown_profile_refused(self):
        self.assertFalse(speak("Тест", "not-a-voice").ok)
    def test_windows_profile_is_explicit(self):
        with patch("voice_engine._windows_sapi", return_value=SpeechResult(False, "Недоступний")) as fn:
            self.assertFalse(speak("Тест", "windows").ok)
            fn.assert_called_once_with("Тест")
    def test_empty_text_does_not_contact_service(self):
        self.assertTrue(speak("  ", "jarvis-deep").ok)

if __name__ == "__main__":
    unittest.main()
