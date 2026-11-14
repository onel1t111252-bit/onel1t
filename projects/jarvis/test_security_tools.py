"""Regression tests for the local-only cybersecurity and deployment tools."""
import unittest
from unittest.mock import patch
from desktop_actions import plan_action, can_execute_directly
from security_tools import inspect_email_bytes, local_network_report


class SecurityCommandTests(unittest.TestCase):
    def test_phishing_route(self):
        plan = plan_action("Джарвісе, перевір цей email на фішинг")
        self.assertEqual(plan.kind, "phishing_check")
        self.assertTrue(can_execute_directly(plan))

    def test_network_route(self):
        plan = plan_action("Джарвісе, перевір безпеку локальної мережі")
        self.assertEqual(plan.kind, "network_report")
        self.assertTrue(can_execute_directly(plan))

    def test_deploy_is_approval_gated(self):
        plan = plan_action("Джарвісе, задеплой ONEL1T")
        self.assertEqual(plan.kind, "onel1t_deploy")
        self.assertTrue(plan.needs_approval)
        self.assertFalse(can_execute_directly(plan))

    def test_email_offline_indicators(self):
        mail = (b"From: Sender <sender@example.com>\r\n"
                b"Reply-To: reply@other.example\r\n"
                b"Authentication-Results: example.org; dmarc=fail\r\n"
                b"Subject: Test email\r\n"
                b"Content-Type: text/plain; charset=utf-8\r\n\r\n"
                b"Visit https://192.0.2.1/path\r\n")
        result = inspect_email_bytes(mail)
        self.assertIn("dmarc=fail", result)
        self.assertIn("192.0.2.1", result)

    def test_email_size_limit(self):
        with self.assertRaises(ValueError):
            inspect_email_bytes(b"x" * 2_000_001)

    @patch("security_tools.os.name", "posix")
    def test_no_windows_network_scan(self):
        self.assertIn("Windows", local_network_report())


if __name__ == "__main__":
    unittest.main()
