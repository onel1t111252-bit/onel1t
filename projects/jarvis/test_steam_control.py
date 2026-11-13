"""Steam game discovery and first-account tests: no Steam login or game launch."""
from __future__ import annotations

import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from desktop_actions import ActionPlan, plan_action, run_action
from steam_control import (
    SteamError, SteamGame, choose_first_account, find_installed_game,
    first_saved_account, installed_games, parse_vdf, open_steam_first,
    launch_installed_game, _open_steam_client, update_first_account_preference,
)

USERS = r'''"users"
{
  "76561197960265729"
  {
    "AccountName"  "first_user"
    "PersonaName"  "First"
    "RememberPassword" "1"
    "MostRecent" "0"
  }
  "76561197960265730"
  {
    "AccountName" "another_user"
    "PersonaName" "Another"
    "RememberPassword" "1"
    "MostRecent" "1"
  }
}
'''

class SteamAccountTests(unittest.TestCase):
    def test_first_account_order(self):
        sid, login, display = first_saved_account(USERS)
        self.assertEqual((sid, login, display),
                         ("76561197960265729", "first_user", "First"))

    def test_preserve_other_vdf_settings_and_second_account(self):
        updated, login, changed = update_first_account_preference(USERS)
        self.assertTrue(changed)
        self.assertEqual(login, "first_user")
        self.assertEqual(updated.count('"MostRecent" "1"'), 1)
        self.assertEqual(updated.count('"MostRecent" "0"'), 1)
        self.assertEqual(updated.count('"RememberPassword" "1"'), 2)
        self.assertIn('"PersonaName"  "First"', updated)
        self.assertEqual(first_saved_account(updated)[1], "first_user")
        self.assertFalse(update_first_account_preference(updated)[2])

    def test_first_not_remembered_requires_manual_auth(self):
        with self.assertRaises(SteamError):
            first_saved_account(USERS.replace('"RememberPassword" "1"',
                                              '"RememberPassword" "0"', 1))

    def test_malformed_account_metadata_is_not_modified(self):
        with self.assertRaises(SteamError):
            update_first_account_preference(USERS.replace('"MostRecent" "0"', '"Broken" "0"'))

    def test_vdf_comments_and_escaping(self):
        data = parse_vdf(r'''// comment
        "root" { "path" "D:\\SteamLibrary" "label" "A \"quoted\" title" }
        ''')
        self.assertEqual(data["root"]["path"].value, r"D:\SteamLibrary")
        self.assertEqual(data["root"]["label"].value, 'A "quoted" title')

    def test_steam_start_requires_owner_approval(self):
        for command, kind in [
            ("Джарвіс, відкрий Steam", "steam_open_first"),
            ("вибери перший акаунт", "steam_open_first"),
            ("відкрий Steam і запусти Cyberpunk 2077", "steam_game"),
            ("запусти гру Portal 2", "steam_game"),
            ("запусти Доту", "steam_game"),
        ]:
            with self.subTest(command=command):
                action = plan_action(command)
                self.assertEqual(action.kind, kind)
                self.assertTrue(action.needs_approval)

    def test_steam_action_without_approval_rejected(self):
        with self.assertRaises(ValueError):
            run_action(ActionPlan("steam_open_first", "", "start", False))
        with self.assertRaises(ValueError):
            run_action(ActionPlan("steam_game", "Portal 2", "start", False))

    def test_list_games_readonly(self):
        action = plan_action("покажи ігри steam")
        self.assertEqual(action.kind, "steam_list")
        self.assertFalse(action.needs_approval)
        with patch("desktop_actions.list_installed_games", return_value="Portal 2"):
            self.assertEqual(run_action(action), "Portal 2")

    def test_steam_still_opens_when_first_account_is_unavailable(self):
        # A missing loginusers.vdf or an unrecognized Steam account picker
        # must never prevent the user's explicit "open Steam" request.
        with patch("steam_control.os.name", "nt"), \
             patch("steam_control.choose_first_account",
                   side_effect=SteamError("Немає доступного списку збережених акаунтів Steam.")), \
             patch("steam_control.os.startfile", create=True) as start:
            message = open_steam_first()
        start.assert_called_once_with("steam://open/main")
        self.assertIn("Автоматичний вибір", message)
        self.assertIn("вибери потрібний акаунт вручну", message)

    def test_steam_still_opens_if_already_running_on_different_account(self):
        with patch("steam_control.os.name", "nt"), \
             patch("steam_control.choose_first_account",
                   side_effect=SteamError("Steam уже працює під іншим акаунтом")), \
             patch("steam_control.os.startfile", create=True) as start:
            message = open_steam_first()
        start.assert_called_once_with("steam://open/main")
        self.assertIn("іншим акаунтом", message)

    def test_steam_still_opens_on_successful_first_account_preference(self):
        with patch("steam_control.os.name", "nt"), \
             patch("steam_control.choose_first_account",
                   return_value="Налаштовано перший збережений акаунт Steam."), \
             patch("steam_control.os.startfile", create=True) as start:
            message = open_steam_first()
        start.assert_called_once_with("steam://open/main")
        self.assertIn("Надіслано команду відкриття Steam", message)
        self.assertIn("не гарантує вхід", message)

    def test_steam_uses_executable_if_uri_unregistered(self):
        fake_dir = Path("C:/Program Files (x86)/Steam")
        with patch("steam_control.os.name", "nt"), \
             patch("steam_control.os.startfile", create=True,
                   side_effect=OSError("URI not registered")) as start, \
             patch("steam_control.steam_root", return_value=fake_dir), \
             patch("steam_control.subprocess.Popen") as launch:
            _open_steam_client()
        start.assert_called_once_with("steam://open/main")
        launch.assert_called_once_with([str(fake_dir / "steam.exe")], shell=False)

    def test_steam_reports_real_error_if_both_launch_methods_fail(self):
        with patch("steam_control.os.name", "nt"), \
             patch("steam_control.os.startfile", create=True,
                   side_effect=OSError("URI not registered")), \
             patch("steam_control.steam_root",
                   side_effect=SteamError("Steam відсутній")):
            with self.assertRaisesRegex(SteamError, "Не вдалося відкрити Steam"):
                _open_steam_client()

    def test_game_does_not_launch_under_unverified_account(self):
        sample = SteamGame("620", "Portal 2", "local")
        with patch("steam_control.os.name", "nt"), \
             patch("steam_control.find_installed_game", return_value=sample), \
             patch("steam_control.choose_first_account",
                   side_effect=SteamError("Не можу визначити активний акаунт")), \
             patch("steam_control._open_steam_client") as open_client, \
             patch("steam_control.os.startfile", create=True) as game_start:
            message = launch_installed_game("Portal 2")
        open_client.assert_called_once_with()
        game_start.assert_not_called()
        self.assertIn("поки не запускав", message)
        self.assertIn("потім повтори", message)

    def test_game_launch_when_first_account_is_configured(self):
        sample = SteamGame("620", "Portal 2", "local")
        with patch("steam_control.os.name", "nt"), \
             patch("steam_control.find_installed_game", return_value=sample), \
             patch("steam_control.choose_first_account",
                   return_value="Перший збережений акаунт Steam уже активний."), \
             patch("steam_control.os.startfile", create=True) as start:
            message = launch_installed_game("Portal 2")
        start.assert_called_once_with("steam://run/620")
        self.assertIn("Команду запуску", message)

    @unittest.skipUnless(os.name == "nt", "Steam registry mutation is Windows-only")
    def test_first_account_file_change_with_backup_and_no_password(self):
        with tempfile.TemporaryDirectory() as td:
            base = Path(td)
            cfg = base / "config"
            cfg.mkdir()
            (cfg / "loginusers.vdf").write_text(USERS, encoding="utf-8")
            with patch("steam_control.steam_running", return_value=False), \
                 patch("steam_control._get_login_registry", return_value="another_user"), \
                 patch("steam_control._set_login_registry") as setreg:
                result = choose_first_account(base)
            self.assertIn("перший збережений", result)
            setreg.assert_called_once_with("first_user")
            updated = (cfg / "loginusers.vdf").read_text(encoding="utf-8")
            self.assertEqual(update_first_account_preference(updated)[2], False)
            self.assertTrue((cfg / "loginusers.vdf.jarvis-backup").is_file())

    @unittest.skipUnless(os.name == "nt", "Steam account verification is Windows-only")
    def test_running_client_must_be_first_account(self):
        with tempfile.TemporaryDirectory() as td:
            cfg = Path(td) / "config"
            cfg.mkdir()
            (cfg / "loginusers.vdf").write_text(USERS, encoding="utf-8")
            with patch("steam_control.steam_running", return_value=True), \
                 patch("steam_control.active_steam_user", return_value=1):
                self.assertIn("активний", choose_first_account(Path(td)))
            with patch("steam_control.steam_running", return_value=True), \
                 patch("steam_control.active_steam_user", return_value=2):
                with self.assertRaises(SteamError):
                    choose_first_account(Path(td))


class SteamLibraryTests(unittest.TestCase):
    def test_installed_games_from_multiple_libraries(self):
        with tempfile.TemporaryDirectory() as td:
            home = Path(td) / "Steam"
            second = Path(td) / "Games"
            steamapps = home / "steamapps"
            otherapps = second / "steamapps"
            (steamapps / "common" / "Portal 2").mkdir(parents=True)
            (otherapps / "common" / "Cyberpunk 2077").mkdir(parents=True)
            (steamapps / "libraryfolders.vdf").write_text(
                '"libraryfolders" { "0" { "path" "' + home.as_posix()
                + '" } "1" { "path" "' + second.as_posix() + '" } }', encoding="utf-8")
            (steamapps / "appmanifest_620.acf").write_text(
                '"AppState" { "appid" "620" "name" "Portal 2" '
                '"StateFlags" "4" "installdir" "Portal 2" }', encoding="utf-8")
            (otherapps / "appmanifest_1091500.acf").write_text(
                '"AppState" { "appid" "1091500" "name" "Cyberpunk 2077" '
                '"StateFlags" "4" "installdir" "Cyberpunk 2077" }', encoding="utf-8")
            (steamapps / "appmanifest_12345.acf").write_text(
                '"AppState" { "appid" "12345" "name" "Not Installed" '
                '"StateFlags" "2" "installdir" "missing" }', encoding="utf-8")
            games = installed_games(home)
        self.assertEqual([g.title for g in games], ["Cyberpunk 2077", "Portal 2"])
        self.assertEqual(find_installed_game("portal 2", games).appid, "620")
        self.assertEqual(find_installed_game("cyberpunk", games).appid, "1091500")

    def test_ambiguous_game_name_rejected(self):
        games = [
            SteamGame("11", "Portal 2", "x"), SteamGame("12", "Portal Stories", "x"),
        ]
        with self.assertRaises(SteamError):
            find_installed_game("Portal", games)

    def test_missing_game_never_invents_steam_id(self):
        with self.assertRaises(SteamError):
            find_installed_game("Game not found", [])

    def test_launch_game_does_not_use_executable_or_shell(self):
        with patch("desktop_actions.launch_installed_game", return_value="Steam command sent") as fn:
            plan = plan_action("запусти гру Portal 2")
            self.assertEqual(run_action(plan), "Steam command sent")
            fn.assert_called_once_with("portal 2")


if __name__ == "__main__":
    unittest.main()
