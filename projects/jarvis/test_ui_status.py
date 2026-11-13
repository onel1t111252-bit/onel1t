import unittest

from ui_status import hud_statuses


class HudStatusTests(unittest.TestCase):
    def test_initial_status_does_not_claim_ai_connection(self):
        result = hud_statuses(None, True, 80, False, False)
        self.assertEqual(result, {"INTELLIGENCE": "AI CHECKING",
                                  "MICROPHONE": "MIC OFF",
                                  "SPEECH": "VOICE 80%"})

    def test_offline_ai_is_not_mislabeled(self):
        result = hud_statuses(False, True, 20, False, False)
        self.assertEqual(result["INTELLIGENCE"], "AI OFFLINE")

    def test_mic_listening_is_not_inferred_from_handsfree_only(self):
        armed = hud_statuses(True, True, 80, True, False)
        listening = hud_statuses(True, True, 80, True, True)
        self.assertEqual(armed["MICROPHONE"], "WAKE MODE ON")
        self.assertEqual(listening["MICROPHONE"], "LISTENING")

    def test_voice_off_and_muted_are_distinct(self):
        self.assertEqual(hud_statuses(True, False, 95, False, False)["SPEECH"], "VOICE OFF")
        self.assertEqual(hud_statuses(True, True, 0, False, False)["SPEECH"], "VOICE MUTED")

    def test_volume_display_is_bounded(self):
        self.assertEqual(hud_statuses(None, True, 500, False, False)["SPEECH"], "VOICE 100%")
        self.assertEqual(hud_statuses(None, True, -200, False, False)["SPEECH"], "VOICE MUTED")


if __name__ == "__main__":
    unittest.main()
