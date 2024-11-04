from django.conf import settings
from django.http import HttpResponseForbidden

class RestrictAPIAccessMiddleware:
    """
    Middleware to restrict access to any endpoint starting with '/api-' when DEBUG is False (production mode).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only restrict API access if DEBUG is False
        if not settings.DEBUG and request.path.startswith('/api-'):
            return HttpResponseForbidden("Access to API is restricted.")
        return self.get_response(request)
