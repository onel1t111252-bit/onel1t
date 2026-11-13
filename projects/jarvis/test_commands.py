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

    def test_youtube_search_voice_variants(self):
        examples = {
            "Джарвіс, знайди відео в ютубі по програмуванню": "програмуванню",
            "знайди відео по програмуванню на ютубі": "програмуванню",
            "знайди на YouTube відео про програмування": "програмування",
            "відкрий ютуб і знайди відео по програмуванню": "програмуванню",
            "відкрий youtube знайди відео про Python": "python",
            "відкрий ютуб та пошукай уроки програмування": "програмування",
            "відкрий ютуб, потім знайди відео про C++": "c++",
            "відкрий ютуб і знайди програмування": "програмування",
            "ютуб знайди програмування": "програмування",
            "знайди мені на ютубі відео про JavaScript": "javascript",
            "покажи відео на тему кібербезпеки": "кібербезпеки",
            "пошукай на ютубі уроки python": "python",
            "відкрий ютуб пошукай мені відео про C#": "c#",
        }
        for spoken, topic in examples.items():
            with self.subTest(spoken=spoken):
                plan = plan_action(spoken)
                self.assertIsNotNone(plan)
                self.assertEqual(plan.kind, "youtube_search")
                self.assertEqual(plan.target, topic)
                self.assertFalse(plan.needs_approval)

    def test_youtube_search_opens_results_not_only_homepage(self):
        action = plan_action("знайди відео на ютубі по програмуванню")
        with patch("desktop_actions.webbrowser.open") as open_browser:
            result = run_action(action)
        open_browser.assert_called_once_with(
            "https://www.youtube.com/results?search_query=%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8E")
        self.assertIn("програмуванню", result)

    def test_youtube_plain_open_and_google_search_unaffected(self):
        home = plan_action("відкрий YouTube")
        self.assertEqual((home.kind, home.target),
                         ("website", "https://www.youtube.com"))
        generic = plan_action("знайди українські книги")
        self.assertEqual(generic.kind, "website")
        self.assertIn("google.com", generic.target)
        self.assertIsNone(plan_action("що таке програмування"))
        # An incomplete search must not silently open a wrong topic.
        self.assertNotEqual(plan_action("знайди відео").kind, "youtube_search")

    def test_safe_search(self):
        self.assertIn("%D1", plan_action("знайди українські книги").target)

    def test_steam_command(self):
        action = plan_action("відкрий стім")
        self.assertEqual((action.kind, action.target), ("steam_open_first", ""))
        self.assertTrue(action.needs_approval)

    def test_steam_dota_combined(self):
        for text in ("гаразд а відкрий стім і запусти доту",
                     "Джарвіс, відкрий Steam і запусти Dota 2",
                     "відкрий стім та запусти доту", "запусти доту",
                     "запусти дота 2 через steam",
                     "гаразд, а відкрий Steam, а потім запусти Dota 2",
                     "добре, відкрий стім; і запусти доту"):
            with self.subTest(text=text):
                plan = plan_action(text)
                self.assertEqual((plan.kind, plan.target), ("steam_game", "Dota 2"))
                self.assertTrue(plan.needs_approval)

    def test_actual_speech_transcript_misheard_steam_without_and(self):
        # Real user screenshot: Google hears "стіні" and drops the "і".
        spoken = [
            "Відкрий стіні Запусти Dota 2",
            "Джарвіс, відкрий стіні запусти доту",
            "відкрий стім запусти Dota 2",
            "відкрий steam запусти дота 2",
            "відкрий стіні і запусти Dota 2",
            "відкрий стіні, потім запусти Dota 2",
            "увімкни Dota 2",
            "запусти Dota2",
            "запусти доту два",
        ]
        for phrase in spoken:
            with self.subTest(phrase=phrase):
                planned = plan_action(phrase)
                self.assertEqual((planned.kind, planned.target),
                                 ("steam_game", "Dota 2"))
                self.assertTrue(planned.needs_approval)

    def test_misheard_steam_single_command_only(self):
        plan = plan_action("відкрий стіні")
        self.assertEqual(plan.kind, "steam_open_first")
        self.assertTrue(plan.needs_approval)
        # Never turn arbitrary phrases into Steam game launches.
        self.assertNotEqual(plan_action("відкрий стінку").kind, "steam_open_first")
        self.assertEqual(plan_action("відкрий Steam і зроби ще щось").kind, "say")

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
        self.assertTrue(a.needs_approval)
        self.assertEqual(a.target, "Dota 2")

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
