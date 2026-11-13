"""Spotify native client controls: unit tests never click/type on the host machine."""
import os
import sys
import types
import unittest
from unittest.mock import Mock, patch

from spotify_desktop import (
    SpotifyDesktopError, validate_query, play_in_desktop,
    _open_and_focus_spotify,
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
             patch("spotify_desktop.time.sleep"), \
             patch.dict(sys.modules, {"pyautogui": keys}):
            reply = play_in_desktop("  Океан Ельзи  ")
        self.assertEqual(keys.hotkey.call_count, 2)
        self.assertEqual(keys.hotkey.call_args_list[0].args, ("ctrl", "k"))
        self.assertEqual(keys.hotkey.call_args_list[1].args, ("ctrl", "a"))
        entered.assert_called_once_with("Океан Ельзи")
        keys.press.assert_called_once_with("enter")
        self.assertIn("встановлений Spotify", reply)
        self.assertIn("без браузера", reply)

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
