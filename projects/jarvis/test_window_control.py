import unittest
from window_control import parse_ui
from desktop_actions import plan_action

class WindowControlTests(unittest.TestCase):
    def test_hotkey_requires_approval(self):
        a = plan_action("Джарвіс, скопіюй")
        self.assertEqual(a.kind, "ui_hotkey")
        self.assertTrue(a.needs_approval)
        self.assertEqual(a.target, "ctrl+c")
    def test_unicode_text_requires_approval(self):
        a = plan_action("надрукуй Привіт, Україно!")
        self.assertEqual(a.kind, "ui_type")
        self.assertTrue(a.needs_approval)
    def test_reject_secrets(self):
        self.assertIsNone(parse_ui("надрукуй пароль 1234"))
    def test_reject_long_text(self):
        self.assertIsNone(parse_ui("надрукуй " + "x" * 501))
    def test_no_arbitrary_shortcut(self):
        self.assertIsNone(parse_ui("натисни ctrl+alt+delete"))

if __name__ == "__main__":
    unittest.main()
