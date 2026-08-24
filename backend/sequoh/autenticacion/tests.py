"""Smoke-test baseline for the ``autenticacion`` app.

Locks the CURRENT behavior of the public auth endpoints, the upload/delete
endpoints, and the variants list endpoint so any future refactor that changes
a response or status code surfaces a test failure.

Coverage (REQ-SLOP-05 / REQ-SLOP-06):
- Auth: LoginAPIView (unknown user -> 400 with ``username`` key), RegisterAPIView
  (missing fields -> 400 with the exact error message).
- Upload: UploadGeneticFileAPIView / DeleteGeneticFileAPIView are auth-gated
  (unauthenticated POST denied).
- Variants: VariantesAPIView list shape (200, ``success`` True, ``count`` int,
  ``data`` list).

REQ-SLOP-04 (silent-swallow -> ``logger.warning``) is locked by an additional
behavioral test asserting a WARNING is emitted on the swallow path while the
response contract stays unchanged.
"""

from unittest import mock

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class AuthSmokeTests(APITestCase):
    """Locks current LoginAPIView / RegisterAPIView behavior."""

    def test_login_unknown_user_returns_400_username(self):
        url = reverse('api_login')
        response = self.client.post(
            url,
            {"username": "none@x.com", "password": "x"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)

    def test_register_missing_fields_returns_400(self):
        url = reverse('api_register')
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["error"],
            "Todos los campos son obligatorios",
        )

    def test_login_warns_and_still_returns_400_on_user_lookup_failure(self):
        """REQ-SLOP-04: a silent swallow now logs a WARNING with no behavior change.

        Making ``User.objects.filter`` raise forces the ``check_user_exists``
        swallow path. The endpoint must still return 400 (contract unchanged) AND
        emit a ``logger.warning`` from the module logger.
        """
        url = reverse('api_login')
        with mock.patch('autenticacion.views.authenticate', return_value=None), \
                mock.patch(
                    'autenticacion.views.User.objects.filter',
                    side_effect=RuntimeError("boom"),
                ):
            with self.assertLogs('autenticacion.views', level='WARNING') as logs:
                response = self.client.post(
                    url,
                    {"username": "none@x.com", "password": "x"},
                    format="json",
                )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(
            any("LoginAPIView.check_user_exists failed" in line for line in logs.output),
            "Expected a WARNING for check_user_exists, got: %r" % logs.output,
        )


class UploadSmokeTests(APITestCase):
    """Locks that the genetic-file endpoints are auth-gated."""

    def test_upload_genetic_file_requires_auth(self):
        url = reverse('api_upload_genetic_file')
        response = self.client.post(url, {}, format="json")
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )

    def test_delete_genetic_file_requires_auth(self):
        # NOTE: DeleteGeneticFileAPIView implements post(), not delete().
        url = reverse('api_delete_genetic_file')
        response = self.client.post(url, {}, format="json")
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )


class VariantesSmokeTests(APITestCase):
    """Locks the VariantesAPIView list response shape."""

    def test_variantes_returns_success_shape(self):
        url = reverse('api_variantes')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIs(response.data["success"], True)
        self.assertIsInstance(response.data["count"], int)
        self.assertIsInstance(response.data["data"], list)
