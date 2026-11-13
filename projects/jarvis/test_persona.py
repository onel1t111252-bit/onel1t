import unittest

from assistant_persona import style_action_reply, concise_speech, cinematic_quick_reply, normalize_spoken


class SirPersonaTests(unittest.TestCase):
    def test_approved_action(self):
        self.assertEqual(style_action_reply("Надсилаю Steam команду.", "known_uri", True),
                         "Є, сер. Надсилаю Steam команду.")

    def test_information(self):
        self.assertEqual(style_action_reply("Зараз 10:00.", "say", True),
                         "Так, сер. Зараз 10:00.")

    def test_no_false_success_on_failure(self):
        self.assertEqual(style_action_reply("Дію не виконано.", "app", False),
                         "Перепрошую, сер. Дію не виконано.")

    def test_not_added_to_ollama_chat(self):
        self.assertEqual(style_action_reply("Готово", "", True), "Готово")

    def test_no_duplicate_prefix(self):
        self.assertEqual(style_action_reply("Є, сер. Виконано.", "app", True),
                         "Є, сер. Виконано.")

    def test_quick_cinematic_responses(self):
        self.assertEqual(cinematic_quick_reply("Джарвіс, ти тут?"),
                         "Так, сер. Слухаю вас.")
        self.assertEqual(cinematic_quick_reply("Дякую!"),
                         "Завжди до ваших послуг, сер.")
        self.assertIsNone(cinematic_quick_reply("відкрий Spotify"))

    def test_tts_never_leaks_dictation_or_window_titles(self):
        self.assertEqual(concise_speech("Є, сер. Введено пароль123", "ui_type", True),
                         "Є, сер.")
        self.assertEqual(concise_speech("Є, сер. Windows: private stuff", "ui_windows", True),
                         "Є, сер.")
        self.assertEqual(concise_speech("Невдала дія: секретний файл", "user_file", False),
                         "Перепрошую, сер. Команду не виконано; деталі на екрані.")

    def test_steam_acknowledgment_does_not_claim_launch_complete(self):
        result = concise_speech("Надсилаю запуск Dota", "known_uri", True)
        self.assertEqual(result, "Є, сер. Команду Steam надіслано.")
        self.assertNotIn("запущено", result)

    def test_youtube_speech_avoids_sending_search_terms_to_tts(self):
        spoken = concise_speech(
            "Відкриваю результати пошуку YouTube: приватна назва.",
            "youtube_search", True)
        self.assertEqual(spoken, "Є, сер. Відкриваю пошук відео на YouTube.")
        self.assertNotIn("приватна", spoken)

    def test_unverified_spotify_does_not_claim_playback_success(self):
        uncertain = ("Надіслав команду Spotify. НЕ ПІДТВЕРДЖЕНО: "
                     "Windows не надав назви треку.")
        self.assertEqual(style_action_reply(uncertain, "spotify_play", True),
                         uncertain)
        spoken = concise_speech(uncertain, "spotify_play", True)
        self.assertIn("не вдалося перевірити", spoken)
        self.assertNotIn("назви треку", spoken)

    def test_neutral_mode(self):
        self.assertEqual(style_action_reply("Готово", "app", True, False), "Готово")
        self.assertEqual(concise_speech("Текст", "ui_type", True, False), "")

    def test_wake_phrase_normalization(self):
        self.assertEqual(normalize_spoken("  Джарвіс,  ти тут?!  "), "джарвіс ти тут")


if __name__ == "__main__":
    unittest.main()
