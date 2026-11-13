import unittest
from desktop_actions import (plan_action, safe_external_url, run_action, normalize, find_installed_app, ActionPlan)
from unittest.mock import patch


class CommandTests(unittest.TestCase):
    def test_allowlist(self):
        a = plan_action("Джарвіс, відкрий блокнот")
        self.assertEqual((a.kind, a.target), ("app", "notepad.exe"))

    def test_unrecognized_application_denied(self):
        self.assertEqual(plan_action("відкрий CMD").kind, "say")

    def test_commands_without_clicks(self):
        self.assertEqual(plan_action("зроби голосніше").kind, "volume")
        self.assertEqual(plan_action("Джарвіс, котра година").kind, "say")

    def test_notes_require_confirmation(self):
        a = plan_action("створи нотатку купити молоко")
        self.assertTrue(a.needs_approval)
        self.assertEqual(a.kind, "note")

    def test_screenshot_requires_confirmation(self):
        self.assertTrue(plan_action("зроби скріншот").needs_approval)

    def test_external_website_requires_confirmation(self):
        a = plan_action("відкрий сайт example.org")
        self.assertEqual(a.kind, "external_url")
        self.assertTrue(a.needs_approval)

    def test_no_untrusted_scheme(self):
        self.assertIsNone(safe_external_url("javascript:alert(1)"))
        self.assertIsNone(safe_external_url("file:///C:/Windows"))
        self.assertIsNone(safe_external_url("https://evil.com@localhost"))
        self.assertIsNone(safe_external_url("http://example.org"))

    def test_no_shell_actions(self):
        self.assertEqual(plan_action("видали всі файли").kind, "say")
        self.assertIsNone(plan_action("Що таке Python?"))

    def test_safe_search(self):
        self.assertIn("%D1", plan_action("знайди українські книги").target)

    def test_steam_command(self):
        action = plan_action("відкрий стім")
        self.assertEqual((action.kind, action.target), ("known_uri", "steam://open/main"))

    def test_steam_dota_combined(self):
        for text in ("гаразд а відкрий стім і запусти доту",
                     "Джарвіс, відкрий Steam і запусти Dota 2",
                     "відкрий стім та запусти доту", "запусти доту",
                     "запусти дота 2 через steam",
                     "гаразд, а відкрий Steam, а потім запусти Dota 2",
                     "добре, відкрий стім; і запусти доту"):
            with self.subTest(text=text):
                plan = plan_action(text)
                self.assertEqual((plan.kind, plan.target), ("known_uri", "steam://run/570"))

    def test_steam_dota_only_approved_uri(self):
        with patch("desktop_actions.os.name", "nt"), patch("desktop_actions.os.startfile", create=True) as launch:
            result = run_action(ActionPlan("known_uri", "steam://run/570", "Dota"))
            launch.assert_called_once_with("steam://run/570")
            self.assertIn("Dota 2", result)
        with patch("desktop_actions.os.name", "nt"):
            with self.assertRaises(ValueError):
                run_action(ActionPlan("known_uri", "steam://run/123456", "Unknown"))

    def test_unknown_multi_command_not_sent_to_ollama(self):
        self.assertEqual(plan_action("відкрий steam і зроби ще щось").kind, "say")

    def test_known_dota_is_not_shell_command(self):
        a = plan_action("відкрий стім і запусти доту")
        self.assertFalse(a.needs_approval)
        self.assertEqual(a.target, "steam://run/570")

    def test_file_picker(self):
        self.assertEqual(plan_action("відкрий файл").kind, "file_picker")

    def test_installed_app_needs_permission(self):
        with patch("desktop_actions.installed_start_apps", return_value=(("Spotify", "Spotify.App.001"),)):
            action = plan_action("відкрий Spotify")
            self.assertEqual(action.kind, "installed_app")
            self.assertTrue(action.needs_approval)

    def test_ukrainian_name_alias(self):
        with patch("desktop_actions.installed_start_apps", return_value=(("Discord", "Discord.App"),)):
            self.assertEqual(plan_action("відкрий дискорд").kind, "installed_app")

    def test_ambiguous_installed_app_refused(self):
        with patch("desktop_actions.installed_start_apps", return_value=(("Teams Beta", "id1"), ("Teams", "id2"))):
            self.assertEqual(plan_action("відкрий Teams").target, "id2")
            self.assertEqual(plan_action("відкрий Tea").kind, "say")

    def test_sensitive_start_app_blocked(self):
        with patch("desktop_actions.installed_start_apps", return_value=(("PowerShell", "badapp"),)):
            self.assertEqual(plan_action("відкрий PowerShell").kind, "say")

    def test_wake_normalization(self):
        self.assertEqual(normalize("Джарвісе, відкрий YouTube"), "відкрий youtube")


if __name__ == "__main__":
    unittest.main()
