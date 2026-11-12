"""Basic command routing checks (do not open applications)."""
import unittest
from jarvis import resolve_command


class CommandTests(unittest.TestCase):
    def test_allowlisted_application(self):
        self.assertEqual(resolve_command("Джарвіс, відкрий блокнот"),
                         ("app", "notepad.exe"))

    def test_reject_unknown_application(self):
        result = resolve_command("відкрий невідома_програма")
        self.assertEqual(result[0], "say")

    def test_search_is_url_encoded(self):
        result = resolve_command("знайди Python tutorials")
        self.assertEqual(result[0], "url")
        self.assertIn("Python+tutorials", result[1])

    def test_non_command_is_for_ai(self):
        self.assertIsNone(resolve_command("Поясни, що таке SQL-ін'єкція"))


if __name__ == "__main__":
    unittest.main()
