import unittest

from assistant_persona import style_action_reply


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


if __name__ == "__main__":
    unittest.main()
