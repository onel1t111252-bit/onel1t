"""Pure parsing and consent tests, runnable without Windows peripherals."""
import unittest
from unittest.mock import patch

from command_sequences import split_sequence
from window_control import parse_ui, perform_ui
from desktop_actions import plan_action, run_action, ActionPlan


class UiV43Tests(unittest.TestCase):
    def test_keys(self):
        self.assertEqual(parse_ui("скопіюй")[:2], ("hotkey", "ctrl+c"))
        self.assertEqual(parse_ui("наступна вкладка")[:2], ("hotkey", "ctrl+tab"))

    def test_typing_preserves_ukrainian(self):
        self.assertEqual(parse_ui("надрукуй Привіт, Україно!")[1], "Привіт, Україно!")

    def test_sensitive_text_not_parsed(self):
        self.assertIsNone(parse_ui("надрукуй пароль 123"))
        self.assertIsNone(parse_ui("введи текст API key: 123"))

    def test_size_and_arbitrary_hotkeys_rejected(self):
        self.assertIsNone(parse_ui("надрукуй " + "x" * 501))
        self.assertIsNone(parse_ui("натисни ctrl+alt+del"))

    def test_visible_window_and_mouse_commands(self):
        self.assertEqual(parse_ui("покажи відкриті вікна")[0], "windows")
        self.assertEqual(parse_ui("перемкнись на Блокнот")[1], "Блокнот")
        self.assertEqual(parse_ui("клацни мишею")[:2], ("click", "cursor"))

    def test_approval_for_every_ui_write(self):
        for cmd in ("скопіюй", "надрукуй Привіт", "прокрути вниз",
                    "клацни мишею", "перемкнись на Блокнот"):
            with self.subTest(cmd=cmd):
                self.assertTrue(plan_action("Джарвіс, " + cmd).needs_approval)

    def test_window_list_read_only(self):
        a = plan_action("покажи вікна")
        self.assertEqual(a.kind, "ui_windows")
        self.assertFalse(a.needs_approval)

    def test_approval_metadata_cannot_be_forged(self):
        with self.assertRaises(ValueError):
            run_action(ActionPlan("ui_click", "cursor", "click", False))

    def test_sequence_split(self):
        self.assertEqual(
            split_sequence("Джарвіс, відкрий блокнот, потім надрукуй Привіт, Україно!"),
            ["відкрий блокнот", "надрукуй Привіт, Україно!"],
        )
        self.assertEqual(split_sequence("гаразд а відкрий Steam і запусти Доту"),
                         ["відкрий Steam", "запусти Доту"])
        self.assertIsNone(split_sequence("відкрий блокнот"))

    def test_dictation_must_be_terminal(self):
        self.assertEqual(split_sequence("надрукуй hello і відкрий Steam"), [])

    def test_no_linux_desktop_execution(self):
        with patch("window_control.os.name", "posix"):
            self.assertIn("Windows", perform_ui("hotkey", "ctrl+c", delay=0))
            self.assertIn("Windows", perform_ui("windows", "", delay=0))


if __name__ == "__main__":
    unittest.main()
