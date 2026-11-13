"""Spotify command/permission tests. These do not access the Spotify API."""
import unittest
from unittest.mock import patch

from desktop_actions import plan_action, run_action, ActionPlan, spotify_music_plan
from spotify_control import (SpotifyConnection, SpotifyError, find_track,
                             pkce_pair, valid_client_id, TRACK_URI_PATTERN)
from assistant_persona import concise_speech
from command_sequences import split_sequence


class SpotifyPlanTests(unittest.TestCase):
    def test_voice_track_request(self):
        plan = plan_action("Джарвіс, увімкни Linkin Park Numb")
        self.assertEqual(plan.kind, "spotify_play")
        self.assertEqual(plan.target, "linkin park numb")
        self.assertTrue(plan.needs_approval)

    def test_spotify_specific_song_and_search(self):
        self.assertEqual(plan_action("відтвори пісню Numb в Spotify").kind, "spotify_play")
        plan = plan_action("знайди в Spotify Numb")
        self.assertEqual(plan.kind, "spotify_search")
        self.assertFalse(plan.needs_approval)

    def test_combined_steam_spotify_commands(self):
        pieces = split_sequence("Джарвіс, відкрий Spotify і увімкни Numb")
        self.assertEqual(pieces, ["відкрий Spotify", "увімкни Numb"])

    def test_fast_search_for_natural_ukrainian_variants(self):
        searches = [
            "знайди пісню Numb в Spotify",
            "знайди в Spotify Numb",
            "пошукай мені пісню Numb у спотіфай",
            "знайди пісню Numb",
            "знайди в спотифай пісню Numb",
        ]
        for command in searches:
            with self.subTest(command=command):
                plan = plan_action("Джарвіс, " + command)
                self.assertIsNotNone(plan)
                self.assertEqual(plan.kind, "spotify_search")
                self.assertEqual(plan.target, "numb")
                self.assertFalse(plan.needs_approval)

    def test_music_not_sent_to_ollama_or_steam(self):
        for command in ("увімкни пісню Numb", "увімкни Numb", "включи в Spotify Numb"):
            with self.subTest(command=command):
                self.assertEqual(plan_action(command).kind, "spotify_play")
        self.assertEqual(plan_action("постав музику на паузу").kind, "spotify_pause")
        self.assertEqual(plan_action("знайди Python tutorial").kind, "website")
        self.assertEqual(plan_action("увімкни звук").kind, "volume")
        self.assertEqual(plan_action("запусти гру Portal 2").kind, "steam_game")

    def test_play_without_api_controls_installed_spotify_not_browser(self):
        from desktop_actions import spotify_connection
        with patch.object(type(spotify_connection), "connected",
                          new_callable=lambda: property(lambda self: False)), \
             patch("desktop_actions.play_in_desktop",
                   return_value="Пісню передано настільному Spotify.") as desktop, \
             patch("desktop_actions.webbrowser.open") as browser:
            result = run_action(plan_action("увімкни пісню Numb"))
        desktop.assert_called_once_with("numb")
        browser.assert_not_called()
        self.assertIn("настільному Spotify", result)

    def test_spotify_api_error_tries_desktop_instead_of_browser(self):
        from desktop_actions import spotify_connection
        with patch.object(type(spotify_connection), "connected",
                          new_callable=lambda: property(lambda self: True)), \
             patch.object(spotify_connection, "play_track",
                          side_effect=SpotifyError("Spotify API offline")), \
             patch("desktop_actions.play_in_desktop",
                   return_value="Пошук у настільному Spotify.") as desktop, \
             patch("desktop_actions.webbrowser.open") as browser:
            result = run_action(plan_action("увімкни пісню Numb"))
        desktop.assert_called_once_with("numb")
        browser.assert_not_called()
        self.assertIn("настільному Spotify", result)

    def test_failed_desktop_attempt_never_opens_browser_or_claims_success(self):
        from desktop_actions import spotify_connection
        from spotify_desktop import SpotifyDesktopError
        with patch.object(type(spotify_connection), "connected",
                          new_callable=lambda: property(lambda self: False)), \
             patch("desktop_actions.play_in_desktop",
                   side_effect=SpotifyDesktopError("Не знайдено Spotify")), \
             patch("desktop_actions.webbrowser.open") as browser:
            with self.assertRaisesRegex(SpotifyError, "Не вдалося відтворити"):
                run_action(plan_action("увімкни пісню Numb"))
        browser.assert_not_called()

    def test_song_name_after_platform_voice_variants(self):
        phrases = (
            "увімкни пісню в Spotify Numb",
            "включи пісню в спотіфай Numb",
            "увімкни в Spotify пісню Numb",
            "включи мені пісню Numb в спотифай",
            "програй пісню Numb через Spotify",
        )
        for phrase in phrases:
            with self.subTest(phrase=phrase):
                action = plan_action("Джарвіс, " + phrase)
                self.assertEqual(action.kind, "spotify_play")
                self.assertEqual(action.target, "numb")
    def test_media_actions(self):
        for command, kind in (
            ("наступна пісня", "spotify_next"),
            ("попередній трек", "spotify_previous"),
            ("постав музику на паузу", "spotify_pause"),
            ("продовж музику", "spotify_resume"),
        ):
            with self.subTest(command=command):
                self.assertEqual(plan_action(command).kind, kind)

    def test_no_interference_with_dota_or_safety(self):
        self.assertEqual(plan_action("Джарвіс, відкрий Steam і запусти Доту").kind,
                         "steam_game")
        self.assertEqual(plan_action("увімкни звук").kind, "volume")
        self.assertNotEqual(plan_action("запусти доту").kind, "spotify_play")

    def test_spotify_actions_require_approval(self):
        with self.assertRaises(ValueError):
            run_action(ActionPlan("spotify_play", "Numb", "play", False))

    def test_web_search_opens_browser_only_with_approval(self):
        plan = plan_action("знайди в Spotify Numb")
        with patch("desktop_actions.webbrowser.open") as browser:
            result = run_action(plan)
        browser.assert_called_once()
        self.assertIn("open.spotify.com/search/", browser.call_args.args[0])
        self.assertIn("Обери композицію", result)

    def test_spotify_title_not_sent_to_voice(self):
        phrase = concise_speech("Є, сер. Spotify: private song", "spotify_play", True)
        self.assertEqual(phrase, "Є, сер.")
        self.assertNotIn("private", phrase)


class SpotifyApiTests(unittest.TestCase):
    def test_client_id_and_pkce(self):
        self.assertTrue(valid_client_id("a" * 32))
        self.assertFalse(valid_client_id("not-a-client-secret"))
        verifier, challenge = pkce_pair()
        self.assertTrue(43 <= len(verifier) <= 128)
        self.assertGreaterEqual(len(challenge), 40)

    def test_find_song_uses_only_valid_track_uri(self):
        correct = "spotify:track:" + "a" * 22
        data = {"tracks": {"items": [
            {"uri": "https://malicious.example", "name": "bad", "artists": [{"name": "x"}]},
            {"uri": correct, "name": "Numb", "artists": [{"name": "Linkin Park"}]}
        ]}}
        self.assertEqual(find_track(data), (correct, "Numb — Linkin Park"))

    def test_find_track_matches_requested_title_and_artist_not_top_hit(self):
        wrong = "spotify:track:" + "b" * 22
        right = "spotify:track:" + "c" * 22
        data = {"tracks": {"items": [
            {"uri": wrong, "name": "In The End", "artists": [{"name": "Linkin Park"}]},
            {"uri": right, "name": "Numb", "artists": [{"name": "Linkin Park"}]}
        ]}}
        self.assertEqual(find_track(data, "Linkin Park Numb")[0], right)
        with self.assertRaisesRegex(SpotifyError, "жоден не збігається"):
            find_track(data, "Nirvana Something In The Way")

    def test_rejects_invalid_results(self):
        with self.assertRaises(SpotifyError):
            find_track({"tracks": {"items": []}})
        self.assertIsNone(TRACK_URI_PATTERN.fullmatch("spotify:track:../../bad"))

    def test_play_track_uses_catalog_uri_and_active_device(self):
        spotify = SpotifyConnection()
        uri = "spotify:track:" + "a" * 22
        results = [
            {"tracks": {"items": [
                {"uri": uri, "name": "Numb", "artists": [{"name": "Linkin Park"}]}
            ]}},
            {"devices": [{"id": "desktop-device", "type": "Computer",
                          "is_active": True, "is_restricted": False}]},
            {}
        ]
        with patch.object(spotify, "_api", side_effect=results) as api:
            answer = spotify.play_track("Numb")
        self.assertIn("Numb — Linkin Park", answer)
        self.assertEqual(api.call_count, 3)
        self.assertEqual(api.call_args_list[-1].args[0], "PUT")
        self.assertEqual(api.call_args_list[-1].args[2], {"uris": [uri]})

    def test_play_track_never_targets_active_phone(self):
        spotify = SpotifyConnection()
        song = "spotify:track:" + "a" * 22
        with patch.object(spotify, "_api", side_effect=[
            {"tracks": {"items": [{
                "uri": song, "name": "Numb",
                "artists": [{"name": "Linkin Park"}]}]}},
            {"devices": [
                {"id": "phone", "type": "Smartphone", "is_active": True,
                 "is_restricted": False},
                {"id": "desktop", "type": "Computer", "is_active": False,
                 "is_restricted": False},
            ]},
        ]) as api:
            with self.assertRaisesRegex(SpotifyError, "активного комп'ютера"):
                spotify.play_track("Numb")
        self.assertEqual(api.call_count, 2)  # no PUT/play sent to phone

    def test_does_not_transfer_to_other_devices(self):
        spotify = SpotifyConnection()
        with patch.object(spotify, "_api", return_value={
            "devices": [{"id": "smart-speaker", "is_active": False}]
        }):
            with self.assertRaises(SpotifyError):
                spotify.player_command("next")

    def test_memory_only_tokens_and_disconnect(self):
        spotify = SpotifyConnection()
        spotify._client_id = "a" * 32
        spotify._set_tokens({"access_token": "temporary", "refresh_token": "refresh", "expires_in": 3600})
        self.assertTrue(spotify.connected)
        self.assertEqual(spotify._fresh_access_token(), "temporary")
        spotify.disconnect()
        self.assertFalse(spotify.connected)


if __name__ == "__main__":
    unittest.main()
