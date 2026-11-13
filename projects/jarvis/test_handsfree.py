"""Unit tests for hands-free voice routing. Never access a real microphone."""
from __future__ import annotations

import queue
import sys
import threading
import time
import types
import unittest
from unittest.mock import MagicMock, patch

import jarvis
from assistant_persona import extract_wake_command
from desktop_actions import can_execute_directly, plan_action


class HandsFreePolicyTests(unittest.TestCase):
    def test_wake_word_variants_and_two_step_activation(self):
        for phrase, expected in (
            ("Джарвіс, відкрий Steam і запусти Dota 2",
             "відкрий Steam і запусти Dota 2"),
            ("Джарвісе! котра година", "котра година"),
            ("Джарвіз відкрий блокнот", "відкрий блокнот"),
            ("Жарвіс, запусти Доту", "запусти Доту"),
            ("Jarvis: Open Steam", "Open Steam"),
            ("джервіс", ""),
        ):
            with self.subTest(phrase=phrase):
                self.assertEqual(extract_wake_command(phrase), expected)
        self.assertIsNone(extract_wake_command("Відкрий Steam"))
        self.assertIsNone(extract_wake_command("Слухаю розмову у фоновому режимі"))

    def test_safe_commands_need_no_separate_confirm(self):
        for spoken in (
            "відкрий блокнот", "відкрий steam", "запусти доту",
            "знайди в Spotify Numb", "увімкни пісню Numb",
            "відкрий youtube", "покажи ігри steam",
        ):
            with self.subTest(spoken=spoken):
                self.assertTrue(can_execute_directly(plan_action(spoken)))

    def test_sensitive_operations_still_require_consent(self):
        for spoken in (
            "надрукуй Привіт", "клацни мишею", "зроби скріншот",
            "відкрий сайт example.org",
        ):
            with self.subTest(spoken=spoken):
                action = plan_action(spoken)
                self.assertTrue(action.needs_approval)
                self.assertFalse(can_execute_directly(action))
        self.assertFalse(can_execute_directly(None))


class _FakeMic:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc, tb):
        return False


def build_app() -> jarvis.JarvisApp:
    app = jarvis.JarvisApp.__new__(jarvis.JarvisApp)
    app.queue = queue.Queue()
    app.mic_lock = threading.Lock()
    app.mic_listening = threading.Event()
    app.handoff_pending = threading.Event()
    app.handsfree_generation = 1
    app.handsfree = threading.Event()
    app.handsfree.set()
    app.speaking = threading.Event()
    app.alive = True
    app.busy = False
    app.pending = None
    app.mic_index = None
    app.mic_energy_threshold = 350.0
    app.mic_calibrated = False
    app.mic_error_streak = 0
    app.last_mic_warning = 0.0
    app.followup_until = 0.0
    app.post = MagicMock()
    return app


class HandsFreeMicrophoneTests(unittest.TestCase):
    def test_recognized_command_emitted_without_button_click(self):
        app = build_app()
        recognizer = MagicMock()
        recognizer.energy_threshold = 260.0
        recognizer.recognize_google.return_value = (
            "Джарвіс, відкрий стіні запусти Dota 2"
        )
        fake_sr = types.ModuleType("speech_recognition")
        fake_sr.Recognizer = lambda: recognizer
        fake_sr.Microphone = lambda device_index=None: _FakeMic()
        with patch.dict(sys.modules, {"speech_recognition": fake_sr}):
            app.listen_once(True)
        messages = []
        while not app.queue.empty():
            messages.append(app.queue.get_nowait())
        self.assertIn(("heard", "відкрий стіні запусти Dota 2"), messages)
        recognizer.adjust_for_ambient_noise.assert_called_once()
        self.assertTrue(app.handsfree.is_set())
        self.assertFalse(app.mic_lock.locked())
        self.assertTrue(app.mic_calibrated)
        self.assertTrue(app.handoff_pending.is_set())

    def test_silence_does_not_reset_dynamic_microphone_threshold(self):
        app = build_app()
        recognizer = MagicMock()
        WaitTimeoutError = type("WaitTimeoutError", (Exception,), {})
        recognizer.energy_threshold = 480.0
        recognizer.listen.side_effect = WaitTimeoutError()
        fake_sr = types.ModuleType("speech_recognition")
        fake_sr.Recognizer = lambda: recognizer
        fake_sr.Microphone = lambda device_index=None: _FakeMic()
        with patch.dict(sys.modules, {"speech_recognition": fake_sr}):
            app.listen_once(True)
        self.assertEqual(app.mic_energy_threshold, 480.0)
        self.assertTrue(app.handsfree.is_set())
        self.assertFalse(app.handoff_pending.is_set())

    def test_restarted_worker_ignores_previous_voice_session(self):
        app = build_app()
        recognizer = MagicMock()
        recognizer.energy_threshold = 310.0
        recognizer.recognize_google.return_value = "Джарвіс, відкрий Steam"
        fake_sr = types.ModuleType("speech_recognition")
        fake_sr.Recognizer = lambda: recognizer
        fake_sr.Microphone = lambda device_index=None: _FakeMic()
        with patch.dict(sys.modules, {"speech_recognition": fake_sr}):
            app.listen_once(True, session_id=0)  # Session 0 already stopped.
        self.assertFalse(any(kind == "heard" for kind, _ in list(app.queue.queue)))
        self.assertTrue(app.handsfree.is_set())

    def test_transient_online_error_does_not_turn_off_handsfree(self):
        app = build_app()
        recognizer = MagicMock()
        RemoteError = type("RequestError", (Exception,), {})
        recognizer.recognize_google.side_effect = RemoteError("temporary network error")
        fake_sr = types.ModuleType("speech_recognition")
        fake_sr.Recognizer = lambda: recognizer
        fake_sr.Microphone = lambda device_index=None: _FakeMic()
        class NoWait:
            def wait(self, seconds=None):
                return False
        with patch.dict(sys.modules, {"speech_recognition": fake_sr}), \
             patch.object(jarvis.threading, "Event", NoWait):
            app.listen_once(True)
        self.assertTrue(app.handsfree.is_set())
        self.assertFalse(app.mic_lock.locked())
        self.assertTrue(any(kind == "hint" for kind, _ in list(app.queue.queue)))

    def test_push_to_talk_does_not_switch_off_handsfree(self):
        app = build_app()
        jarvis.JarvisApp.push_to_talk(app)
        self.assertTrue(app.handsfree.is_set())
        app.post.assert_called_once()


if __name__ == "__main__":
    unittest.main()
