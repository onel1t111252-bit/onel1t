"""Local AI intent router regression tests. Mock Ollama; never run Windows actions."""
import json
import unittest
from unittest.mock import patch

from ai_router import validate_suggestion, should_infer, suggest_action


class AiRouterSafetyTests(unittest.TestCase):
    def test_natural_language_music_and_video_intents(self):
        examples = [
            ("Я хочу послухати пісню Jingle Bells у Spotify",
             "spotify_play", "Jingle Bells"),
            ("Could you play the song Jane! The Long Faces on Spotify",
             "spotify_play", "Jane! The Long Faces"),
            ("Хочу подивитися відео про програмування на YouTube",
             "youtube_search", "програмування"),
            ("Можеш пошукати відео про Python",
             "youtube_search", "Python"),
        ]
        for sentence, kind, target in examples:
            with self.subTest(sentence=sentence):
                self.assertTrue(should_infer(sentence))
                plan = validate_suggestion(sentence, {"intent": kind, "target": target})
                self.assertIsNotNone(plan)
                self.assertEqual((plan.kind, plan.target), (kind, target))
                self.assertEqual(plan.needs_approval, kind == "spotify_play")

    def test_hallucinated_or_rewritten_song_name_is_rejected(self):
        spoken = "Я хочу увімкнути пісню Jan в Spotify"
        # AI cannot "guess" whether Jan means Jane!, Jingle Bells or anyone else.
        for guess in ("Jane!", "Jingle Bells", "Jan"):
            with self.subTest(guess=guess):
                self.assertIsNone(validate_suggestion(
                    spoken, {"intent": "spotify_play", "target": guess}))

    def test_never_execute_commands_arbitrary_targets_or_unsafe_operations(self):
        unsafe = [
            ("Видали всі мої файли", "youtube_search", "файли"),
            ("Надрукуй мій пароль в Spotify", "spotify_play", "spotify"),
            ("Який твій улюблений трек у Spotify", "spotify_play", "улюблений"),
            ("Hello, how are you", "spotify_play", "Hello"),
            ("Хочу подивитися відео про Python", "system_shell", "Python"),
            ("Хочу подивитися відео про Python", "youtube_search", "rm -rf"),
        ]
        for source, kind, target in unsafe:
            with self.subTest(source=source, kind=kind):
                self.assertIsNone(validate_suggestion(
                    source, {"intent": kind, "target": target}))
        self.assertFalse(should_infer("How does Python programming work?"))

    def test_only_required_exact_json_keys_allowed(self):
        sentence = "хочу подивитися відео про програмування"
        self.assertIsNone(validate_suggestion(
            sentence, {"intent": "youtube_search", "target": "програмування",
                       "command": "powershell.exe"}))

    def test_structured_ollama_response_validated_before_action(self):
        sentence = "Хочу подивитися відео про програмування на YouTube"
        reply = json.dumps({
            "message": {"content": json.dumps({
                "intent": "youtube_search", "target": "програмування"
            }, ensure_ascii=False)}
        }, ensure_ascii=False).encode("utf-8")

        class Response:
            def __enter__(self):
                return self
            def __exit__(self, *_):
                pass
            def read(self, *_):
                return reply

        with patch("ai_router.request.urlopen", return_value=Response()) as call:
            plan = suggest_action(sentence, "qwen3.5:4b")
        self.assertEqual(plan.kind, "youtube_search")
        req = call.call_args.args[0]
        self.assertTrue(req.full_url.startswith("http://127.0.0.1:11434/"))
        payload = json.loads(req.data)
        self.assertFalse(payload["think"])
        self.assertFalse(payload["stream"])
        self.assertEqual(payload["format"]["additionalProperties"], False)
        self.assertEqual(payload["model"], "qwen3.5:4b")

    def test_local_ollama_failure_is_non_executing(self):
        with patch("ai_router.request.urlopen", side_effect=OSError("offline")):
            self.assertIsNone(suggest_action("Хочу послухати пісню Jingle Bells",
                                             "qwen3.5:4b"))

    def test_no_ai_round_trip_for_regular_conversation(self):
        with patch("ai_router.request.urlopen") as urlopen:
            self.assertIsNone(suggest_action("Що таке кібербезпека?", "qwen3.5:4b"))
        urlopen.assert_not_called()


class AiIntegrationTests(unittest.TestCase):
    def test_jarvis_worker_uses_model_router_only_for_unrecognized_command(self):
        import queue
        import tempfile
        from pathlib import Path
        from desktop_actions import ActionPlan
        from jarvis import JarvisApp

        app = JarvisApp.__new__(JarvisApp)
        app.ai_model = "qwen3.5:4b"
        app.history = []
        app.cinematic_mode = True
        app.queue = queue.Queue()
        suggestion = ActionPlan(
            "spotify_play", "Jingle Bells", "Відтворити Jingle Bells", True)
        with tempfile.TemporaryDirectory() as folder, \
             patch("jarvis.ROOT_DIR", Path(folder)), \
             patch("jarvis.suggest_action", return_value=suggestion) as infer, \
             patch("jarvis.run_action",
                   return_value="Запит надіслано в Spotify") as run_action, \
             patch("jarvis.ollama_chat") as chat:
            app.answer_worker("Хочу послухати пісню Jingle Bells", None)
        infer.assert_called_once_with(
            "Хочу послухати пісню Jingle Bells",
            "qwen3.5:4b", "http://127.0.0.1:11434")
        run_action.assert_called_once_with(suggestion)
        chat.assert_not_called()
        event, (answer, success, kind) = app.queue.get_nowait()
        self.assertEqual(event, "answer")
        self.assertTrue(success)
        self.assertEqual(kind, "spotify_play")

    def test_regular_question_goes_to_selected_local_chat_model(self):
        import queue
        from jarvis import JarvisApp
        app = JarvisApp.__new__(JarvisApp)
        app.ai_model = "qwen3.5:9b"
        app.history = []
        app.cinematic_mode = False
        app.queue = queue.Queue()
        with patch("jarvis.suggest_action", return_value=None), \
             patch("jarvis.ollama_chat",
                   return_value=("Пояснення для користувача.", [])) as chat:
            app.answer_worker("Розкажи про Python", None)
        chat.assert_called_once_with(
            "Розкажи про Python", [], False, "qwen3.5:9b")
        self.assertEqual(app.queue.get_nowait()[1][0],
                         "Пояснення для користувача.")

    def test_model_status_uses_selected_model_not_old_hardcoded_name(self):
        from jarvis import ollama_status
        response = json.dumps({"models": [{"name": "qwen3.5:4b"},
                                          {"name": "jarvis:latest"}]}).encode()

        class Resp:
            def __enter__(self):
                return self
            def __exit__(self, *_):
                return None
            def read(self, *_):
                return response

        with patch("jarvis.request.urlopen", return_value=Resp()):
            self.assertEqual(ollama_status("qwen3.5:4b"),
                             (True, "AI ONLINE / qwen3.5:4b"))
            self.assertEqual(ollama_status("qwen3.5:9b"),
                             (False, "MODEL NOT INSTALLED / qwen3.5:9b"))



if __name__ == "__main__":
    unittest.main()
