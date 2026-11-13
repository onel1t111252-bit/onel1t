"""Spotify native client controls: unit tests never click/type on the host machine."""
import os
import sys
import types
import unittest
from unittest.mock import Mock, patch

from spotify_desktop import (
    SpotifyDesktopError, SpotifyPlayback, validate_query,
    play_in_desktop, _open_and_focus_spotify,
    _track_matches, _playback_feedback,
)


class NativeSpotifyTests(unittest.TestCase):
    def test_song_names_can_be_ukrainian_but_not_control_characters(self):
        self.assertEqual(validate_query("  Океан Ельзи Обійми  "),
                         "Океан Ельзи Обійми")
        with self.assertRaises(SpotifyDesktopError):
            validate_query("Numb\npowershell.exe")
        with self.assertRaises(SpotifyDesktopError):
            validate_query(" ")
        with self.assertRaises(SpotifyDesktopError):
            validate_query("a" * 121)

    def test_local_playback_uses_spotify_quick_search_not_browser(self):
        keys = types.SimpleNamespace(hotkey=Mock(), press=Mock())
        with patch("spotify_desktop.os.name", "nt"), \
             patch("spotify_desktop._open_and_focus_spotify", return_value=42), \
             patch("spotify_desktop._still_focused", return_value=True), \
             patch("spotify_desktop._type_unicode") as entered, \
             patch("spotify_desktop._read_spotify_playback",
                   return_value=SpotifyPlayback("Обійми", "Океан Ельзи", True)), \
             patch("spotify_desktop.time.sleep"), \
             patch.dict(sys.modules, {"pyautogui": keys}):
            reply = play_in_desktop("  Океан Ельзи  ")
        self.assertEqual(keys.hotkey.call_count, 2)
        self.assertEqual(keys.hotkey.call_args_list[0].args, ("ctrl", "k"))
        self.assertEqual(keys.hotkey.call_args_list[1].args, ("ctrl", "a"))
        entered.assert_called_once_with("Океан Ельзи")
        self.assertEqual(keys.press.call_count, 2)
        self.assertEqual(keys.press.call_args_list[0].args, ("down",))
        self.assertEqual(keys.press.call_args_list[1].args, ("enter",))
        self.assertIn("Підтверджено у Windows", reply)

    def test_selected_song_must_match_user_request(self):
        correct = SpotifyPlayback("Numb", "Linkin Park", True)
        wrong = SpotifyPlayback("In The End", "Linkin Park", True)
        paused = SpotifyPlayback("Numb", "Linkin Park", False)
        self.assertTrue(_track_matches("Linkin Park Numb", correct))
        self.assertFalse(_track_matches("Linkin Park Numb", wrong))
        self.assertIn("Підтверджено", _playback_feedback("Numb", correct))
        self.assertIn("не відповідає", _playback_feedback("Numb", wrong))
        self.assertIn("НЕ активне", _playback_feedback("Numb", paused))
        self.assertIn("Не можу підтвердити", _playback_feedback("Numb", None))

    def test_status_reports_app_missing_or_known_song(self):
        from spotify_desktop import spotify_desktop_status
        with patch("spotify_desktop.os.name", "nt"), \
             patch("spotify_desktop._spotify_window", return_value=None):
            self.assertIn("Не знайшов", spotify_desktop_status())
        with patch("spotify_desktop.os.name", "nt"), \
             patch("spotify_desktop._spotify_window", return_value=42), \
             patch("spotify_desktop._read_spotify_playback",
                   return_value=SpotifyPlayback("Numb", "Linkin Park", True)):
            status = spotify_desktop_status()
        self.assertIn("Numb", status)
        self.assertIn("ВІДТВОРЮЄТЬСЯ", status)

    def test_wrong_song_never_reported_as_success(self):
        keys = types.SimpleNamespace(hotkey=Mock(), press=Mock())
        with patch("spotify_desktop.os.name", "nt"), \
             patch("spotify_desktop._open_and_focus_spotify", return_value=42), \
             patch("spotify_desktop._still_focused", return_value=True), \
             patch("spotify_desktop._type_unicode"), \
             patch("spotify_desktop._read_spotify_playback",
                   return_value=SpotifyPlayback("Smells Like Teen Spirit", "Nirvana", True)), \
             patch("spotify_desktop.time.sleep"), \
             patch.dict(sys.modules, {"pyautogui": keys}):
            with self.assertRaisesRegex(SpotifyDesktopError, "не відповідає"):
                play_in_desktop("Numb")
        keys.press.assert_any_call("down")
        keys.press.assert_any_call("enter")

    def test_not_playing_is_not_reported_as_success(self):
        keys = types.SimpleNamespace(hotkey=Mock(), press=Mock())
        with patch("spotify_desktop.os.name", "nt"), \
             patch("spotify_desktop._open_and_focus_spotify", return_value=42), \
             patch("spotify_desktop._still_focused", return_value=True), \
             patch("spotify_desktop._type_unicode"), \
             patch("spotify_desktop._read_spotify_playback",
                   return_value=SpotifyPlayback("Numb", "Linkin Park", False)), \
             patch("spotify_desktop.time.sleep"), \
             patch.dict(sys.modules, {"pyautogui": keys}):
            with self.assertRaisesRegex(SpotifyDesktopError, "НЕ активне"):
                play_in_desktop("Numb")

    def test_unverifiable_song_reports_failure_not_false_playback(self):
        keys = types.SimpleNamespace(hotkey=Mock(), press=Mock())
        with patch("spotify_desktop.os.name", "nt"), \
             patch("spotify_desktop._open_and_focus_spotify", return_value=42), \
             patch("spotify_desktop._still_focused", return_value=True), \
             patch("spotify_desktop._type_unicode"), \
             patch("spotify_desktop._read_spotify_playback", return_value=None), \
             patch("spotify_desktop.time.sleep"), \
             patch.dict(sys.modules, {"pyautogui": keys}):
            with self.assertRaisesRegex(SpotifyDesktopError, "Не можу підтвердити"):
                play_in_desktop("Numb")

    def test_does_not_type_into_other_foreground_window(self):
        keys = types.SimpleNamespace(hotkey=Mock(), press=Mock())
        with patch("spotify_desktop.os.name", "nt"), \
             patch("spotify_desktop._open_and_focus_spotify", return_value=42), \
             patch("spotify_desktop._still_focused", return_value=False), \
             patch("spotify_desktop._type_unicode") as typed, \
             patch.dict(sys.modules, {"pyautogui": keys}):
            with self.assertRaisesRegex(SpotifyDesktopError, "втратив фокус"):
                play_in_desktop("Numb")
        typed.assert_not_called()
        keys.hotkey.assert_not_called()
        keys.press.assert_not_called()

    def test_stops_if_focus_changes_before_play(self):
        keys = types.SimpleNamespace(hotkey=Mock(), press=Mock())
        with patch("spotify_desktop.os.name", "nt"), \
             patch("spotify_desktop._open_and_focus_spotify", return_value=42), \
             patch("spotify_desktop._still_focused",
                   side_effect=[True, True, False]), \
             patch("spotify_desktop._type_unicode") as typed, \
             patch("spotify_desktop.time.sleep"), \
             patch.dict(sys.modules, {"pyautogui": keys}):
            with self.assertRaisesRegex(SpotifyDesktopError, "втратив фокус"):
                play_in_desktop("Numb")
        typed.assert_called_once_with("Numb")
        keys.press.assert_not_called()

    @unittest.skipUnless(os.name == "nt", "Native Spotify focus requires Windows")
    def test_missing_app_returns_clear_instruction_without_desktop_keys(self):
        with patch("spotify_desktop._spotify_window", return_value=None), \
             patch("spotify_desktop.os.startfile",
                   side_effect=OSError("protocol missing")):
            with self.assertRaisesRegex(SpotifyDesktopError, "меню «Пуск»"):
                _open_and_focus_spotify()


if __name__ == "__main__":
    unittest.main()
