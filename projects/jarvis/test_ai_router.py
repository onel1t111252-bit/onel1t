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


if __name__ == "__main__":
    unittest.main()
